import mongoose from 'mongoose'

const CartFlavorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false },
)

const CartExtraSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false },
)

const CartConfigurationSchema = new mongoose.Schema(
    {
        flavors: {
            type: [CartFlavorSchema],
            default: [],
        },
        extras: {
            type: [CartExtraSchema],
            default: [],
        },
    },
    { _id: false },
)

const CartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                    min: 1,
                },
                configuration: {
                    type: CartConfigurationSchema,
                    default: null,
                },
            },
        ],
    },
    { timestamps: true },
)

export default mongoose.model('Cart', CartSchema)
