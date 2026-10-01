import mongoose from 'mongoose'

const FlavorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        available: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true }  //cada sabor tiene su propio id
)

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            default: null,
        },
        inventoryType: {
            type: String,
            required: true,
            enum: ['flavor', 'stock'],
        },
        // Solo si inventoryType === 'stock'
        stock: {
            type: Number,
            min: 0,
            required: function () {
                return this.inventoryType === 'stock'
            },
        },
        // Solo si inventoryType === 'flavor'
        flavors: {
            type: [FlavorSchema],
            default: [],
        },
        // Posición/orden manual en el catálogo
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

export default mongoose.model('Product', ProductSchema)