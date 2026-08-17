import mongoose from 'mongoose'
import slugify from 'slugify'

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            trim: true,
            lowercase: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

// Genera el slug automáticamente a partir del name, solo si cambió
CategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true })
    }
    next()
})

export default mongoose.model('Category', CategorySchema)