import mongoose from 'mongoose'

const FlavorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        available: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

export default mongoose.model('Flavor', FlavorSchema)
