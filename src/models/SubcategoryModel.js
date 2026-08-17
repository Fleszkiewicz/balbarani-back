import mongoose from 'mongoose'
import slugify from 'slugify'

const SubcategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
            lowercase: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
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

SubcategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true })
    }
    next()
})

// Único DENTRO de su categoría, no globalmente
SubcategorySchema.index({ category: 1, slug: 1 }, { unique: true })

export default mongoose.model('Subcategory', SubcategorySchema)