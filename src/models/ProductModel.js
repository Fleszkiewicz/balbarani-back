import mongoose from 'mongoose'

const FlavorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required:true,
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
            ref: 'Subcategory',
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
                return this.inventory === 'stock'
            },
        },
        // Solo si inventoryType === 'flavor'
        flavors: {
            type: [FlavorSchema],
            validate: {
                validator: function (value) {
                    if (this.inventoryType === 'flavor') {
                        return Array.isArray(value) && value.length > 0
                    }
                    return true
                },
                message: 'Debe cargar al menos un sabor',
            },
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

export default mongoose.model('Product', ProductSchema)