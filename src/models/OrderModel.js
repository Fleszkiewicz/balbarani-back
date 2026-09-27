import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        shippingDetails: {
            name: { type: String, required: true },
            lastName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
        },
        products: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                quantity: Number,
                price: Number,
                configuration: mongoose.Schema.Types.Mixed,
            }
        ],
        total: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['mercadopago', 'efectivo'],
            required: true
        },
        // 1. Estado del Pago (Pendiente / Pagado)
        paymentStatus: {
            type: String,
            enum: ['pendiente', 'pagado'],
            default: 'pendiente',
        },
        // 2. Estado del Pedido (Flujo de la heladería)
        status: {
            type: String,
            enum: ['pendiente', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'],
            default: 'pendiente',
        },
        paymentId: {
            type: String,
            default: null,
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },

    },
    { timestamps: true }
)

export default mongoose.model('Order', OrderSchema)
