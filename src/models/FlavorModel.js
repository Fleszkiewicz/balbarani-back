import mongoose from 'mongoose'

export const FLAVOR_CATEGORIES = [
    'Cremas',
    'Frutales',
    'Chocolates',
    'Dulce de leches',
]

const FlavorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        category: {
            type: String,
            enum: FLAVOR_CATEGORIES,
            default: 'Cremas',
            required: true,
        },
        available: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

export default mongoose.model('Flavor', FlavorSchema)
