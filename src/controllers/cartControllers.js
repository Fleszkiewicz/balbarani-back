import CartModel from '../models/CartModel.js'
import ProductModel from '../models/ProductModel.js'
import {
    calculateLineUnitTotal,
    isSameCartLine,
    validateFlavorConfiguration,
} from '../utils/artisanIceCream.js'

const validateExtras = async (extras = []) => {
    for (const extra of extras) {
        const extraProduct = await ProductModel.findById(extra.productId)

        if (!extraProduct) {
            return {
                valid: false,
                message: `El extra ${extra.name} no existe`,
            }
        }

        if (
            extraProduct.inventoryType === 'stock' &&
            extraProduct.stock < extra.quantity
        ) {
            return {
                valid: false,
                message: `Solo hay ${extraProduct.stock} unidades de ${extra.name}`,
            }
        }
    }

    return { valid: true }
}

export const addToCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.body.userId
        const { productId, quantity = 1, configuration = null } = req.body

        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        if (!productId) {
            return res
                .status(400)
                .json({ message: 'El productId es requerido' })
        }

        if (quantity < 1) {
            return res
                .status(400)
                .json({ message: 'La cantidad debe ser al menos de 1' })
        }

        const product = await ProductModel.findById(productId)

        if (!product) {
            return res.status(400).json({ message: 'Producto no econtrado' })
        }

        if (product.inventoryType === 'flavor') {
            const flavorValidation = await validateFlavorConfiguration(
                product,
                configuration,
            )

            if (!flavorValidation.valid) {
                return res.status(400).json({
                    message: flavorValidation.message,
                })
            }
        }

        if (product.inventoryType === 'stock' && product.stock < quantity) {
            return res.status(400).json({
                message: `Solo hay ${product.stock} de unidades disponibles`,
            })
        }

        const extrasValidation = await validateExtras(configuration?.extras)
        if (!extrasValidation.valid) {
            return res.status(400).json({ message: extrasValidation.message })
        }

        let cart = await CartModel.findOne({ userId })

        if (cart) {
            const productIndex = cart.products.findIndex((item) =>
                isSameCartLine(item, productId, configuration),
            )

            if (productIndex > -1) {
                cart.products[productIndex].quantity += quantity
            } else {
                cart.products.push({
                    productId,
                    quantity,
                    configuration,
                })
            }
        } else {
            cart = new CartModel({
                userId,
                products: [{ productId, quantity, configuration }],
            })
        }

        await cart.save()
        await cart.populate('products.productId')

        res.status(200).json({
            message: 'Producto agregado al carrito',
            cart,
        })
    } catch (error) {
        res.status(500).json({ message: 'ERROR', error: error.message })
    }
}

export const getCart = async (req, res) => {
    try {
        const { userId } = req.params

        const cart = await CartModel.findOne({ userId }).populate(
            'products.productId',
        )

        if (cart) {
            res.status(200).json({
                message: 'Carrito obtenido con éxito',
                cart,
            })
        } else {
            res.status(404).json({ message: 'Carrito no econtrado' })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al obtener el carrito',
            error: error.message,
        })
    }
}

export const updateCart = async (req, res) => {
    try {
        const { userId } = req.params
        const { productId, quantity, configuration = null } = req.body

        const cart = await CartModel.findOne({ userId })

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no econtrado' })
        }

        const productIndex = cart.products.findIndex((item) =>
            isSameCartLine(item, productId, configuration),
        )

        if (productIndex > -1) {
            const product = await ProductModel.findById(productId)

            if (!product) {
                return res.status(404).json({
                    message: 'Producto no econtrado',
                })
            }

            if (product.inventoryType === 'stock' && quantity > product.stock) {
                return res.status(400).json({
                    message: `Solo hay ${product.stock} unidades disponibles`,
                })
            }

            cart.products[productIndex].quantity = quantity
            await cart.save()

            res.status(200).json({
                message: 'Carrito actualizado con éxito',
                cart,
            })
        } else {
            res.status(404).json({
                message: 'Producto no econtrado en el carrito',
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al actualizar el carrito',
            error: error.message,
        })
    }
}

export const removeProductFromCart = async (req, res) => {
    try {
        const { userId } = req.params
        const { productId, configuration = null } = req.body

        if (!userId) {
            return res.status(400).json({ message: 'El userId es requerido' })
        }

        const cart = await CartModel.findOne({ userId })

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' })
        }

        const productIndex = cart.products.findIndex((item) =>
            isSameCartLine(item, productId, configuration),
        )

        if (productIndex > -1) {
            cart.products.splice(productIndex, 1)
            await cart.save()

            res.status(200).json({
                message: 'Producto eliminado del carrito con éxito',
                cart,
            })
        } else {
            res.status(404).json({
                message: 'Producto no encontrado en el carrito',
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al eliminar el producto del carrito',
        })
    }
}

export const clearCart = async (req, res) => {
    try {
        const { userId } = req.params

        const cart = await CartModel.findOne({ userId })

        if (cart) {
            cart.products = []
            await cart.save()
            res.status(200).json({
                message: 'Carrito vaciado con éxito',
                cart,
            })
        } else {
            res.status(404).json({
                message: 'Carrito no encontrado',
            })
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al eliminar un producto',
        })
    }
}

export const getCartTotal = async (req, res) => {
    try {
        const userId = req.user?._id || req.params.userId

        if (!userId) {
            return res.status(400).json({
                message: 'El userId es requerid',
            })
        }

        const cart = await CartModel.findOne({ userId }).populate(
            'products.productId',
        )

        if (!cart) {
            return res.status(404).json({
                message: 'Carrito no encontrado',
            })
        }

        const total = cart.products.reduce((acc, item) => {
            const unitTotal = calculateLineUnitTotal(
                item.productId.price,
                item.configuration,
            )
            return acc + unitTotal * item.quantity
        }, 0)

        res.status(200).json({
            message: 'Total obtenido con éxito',
            total,
        })
    } catch (error) {
        res.status(500).json({
            message: 'Error del servidor al obtener el total',
        })
    }
}
