import OrderModel from '../models/OrderModel.js';
import UserModel from '../models/UserModel.js';
import CartModel from '../models/CartModel.js';
import { calculateLineUnitTotal } from '../utils/artisanIceCream.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import SettingModel from '../models/SettingModel.js';

// Configuramos MercadoPago. 
// TIP: Luego vas a tener que agregar MP_ACCESS_TOKEN a tu archivo .env
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-TU_ACCESS_TOKEN' });

export const createOrder = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { name, lastName, phone, address, paymentMethod } = req.body;

        if (!userId) return res.status(400).json({ message: 'Usuario no autenticado' });

        // 1. Actualizar datos del usuario para compras futuras
        await UserModel.findByIdAndUpdate(userId, { name, lastName, phone, address });

        // 2. Obtener el carrito del usuario
        const cart = await CartModel.findOne({ userId }).populate('products.productId');

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }


        // Obtener el costo de delivery actual
        let deliveryFee = 0;
        const feeSetting = await SettingModel.findOne({ key: 'deliveryFee' });
        if (feeSetting && !isNaN(Number(feeSetting.value))) {
            deliveryFee = Number(feeSetting.value);
        }

        // 3. Calcular el total de productos
        let productsTotal = 0;
        const orderProducts = cart.products.map(item => {
            const unitTotal = calculateLineUnitTotal(item.productId.price, item.configuration);
            productsTotal += unitTotal * item.quantity;
            return {
                productId: item.productId._id,
                quantity: item.quantity,
                price: unitTotal,
                configuration: item.configuration
            };
        });

        const total = productsTotal + deliveryFee;

        // 4. Crear la Orden
        const newOrder = new OrderModel({
            userId,
            shippingDetails: { name, lastName, phone, address },
            products: orderProducts,
            deliveryFee,
            total,
            paymentMethod
        });
        await newOrder.save();


        // 5. Si eligió MercadoPago, generamos el link de pago ANTES de vaciar el carrito
        let init_point = null;
        if (paymentMethod === 'mercadopago') {
            const preference = new Preference(client);

            const items = cart.products.map(item => ({
                id: item.productId._id.toString(),
                title: item.productId.name,
                unit_price: calculateLineUnitTotal(item.productId.price, item.configuration),
                quantity: item.quantity,
                currency_id: 'ARS'
            }));

            const response = await preference.create({
                body: {
                    items: items,
                    back_urls: {
                        success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/success`,
                        failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/failure`,
                        pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/pending`,
                    },
                    auto_return: "approved",
                    external_reference: newOrder._id.toString(),
                }
            });

            init_point = response.init_point;
        }

        // 6. Ahora sí vaciamos el carrito (sirve tanto para Efectivo como para MercadoPago)
        cart.products = [];
        await cart.save();

        // 7. Responder al Frontend
        if (paymentMethod === 'mercadopago') {
            return res.status(200).json({
                message: 'Orden creada con MercadoPago',
                order: newOrder,
                init_point
            });
        }

        // Si es pago en efectivo
        return res.status(200).json({
            message: 'Orden creada exitosamente (Pago en efectivo)',
            order: newOrder
        });

    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}


//Obtener todas las ordenes (ADMIN)
export const getOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find()
            .populate('userId', 'email username')
            .populate('products.productId', 'name price imageUrl')
            .sort({ createdAt: -1 }); //la mas reciente primero

        return res.status(200).json({
            message: "Ordenes obtenidas correctamente",
            orders,
        });
    } catch (error) {
        console.error('Error al obtener ordenes', error);
        return res.status(500).json({
            message: 'Error al obtener las ordenes',
            error: error.message
        });
    }
}

// Cambiar el estado de una orden o de su pago (solo para admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await OrderModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate('userId', 'email username')
            .populate('products.productId', 'name price imageUrl');

        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        return res.status(200).json({
            message: 'Orden actualizada con éxito',
            order,
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        return res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
    }
};
