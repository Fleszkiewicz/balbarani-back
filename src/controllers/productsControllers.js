import { productSchema } from '../schemas/productSchema.js'
import ProductModel from '../models/ProductModel.js'
import CategoryModel from '../models/CategoryModel.js'
import SubcategoryModel from '../models/SubcategoryModel.js'
import { ZodError } from 'zod'

export const createProduct = async (req, res) => {
    try {
        const validatedData = productSchema.parse(req.body)

        const product = await ProductModel.create(validatedData)

        return res
            .status(201)
            .json({ message: 'Producto creado exitosamente', product })
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(
                    error.issues.map((issues) => ({ message: issues.message }))
                )
        }

        return res
            .status(500)
            .json({ message: 'Error al crear el producto', error: error })
    }
}

export const updateProduct = async (req, res) => {
    try {
        //1: validar los datos de entrada con zod
        const validateData = productSchema.partial().parse(req.body)

        //2: buscar y actualizar el producto
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            validateData,
            { new: true, runValidators: true }
        )

        //3: manejar el caso de que el producto no exista
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' })
        }

        //4: devolver producto actualizado
        return res.status(200).json(updatedProduct)
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(
                    error.issues.map((issues) => ({ message: issues.message }))
                )
        }
        res.status(500).json({ message: 'Error al actualizar el producto' })
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
        return res.status(200).json(product)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al obtener el producto', error: error })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const { category, subcategory } = req.query
        const filter = {}

        if (category) {
            const categoryDoc = await CategoryModel.findOne({ slug: category })
            if (!categoryDoc) {
                return res.status(404).json({ message: 'Categoría no encontrada' })
            }
            filter.category = categoryDoc._id
        }

        if (subcategory) {
            const subcategoryDoc = await SubcategoryModel.findOne({
                slug: subcategory,
            })
            if (!subcategoryDoc) {
                return res
                    .status(404)
                    .json({ message: 'Subcategoría no encontrada' })
            }
            filter.subcategory = subcategoryDoc._id
        }

        const products = await ProductModel.find(filter)
            .sort({ order: 1 }) // <-- Ordenar por campo order ascendente
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')

        return res.status(200).json(products)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al obtener los productos', error: error })
    }
}

export const deleteProducts = async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id)
        return res.status(200).json(product)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al eliminar el producto', error: error })
    }
}


// Reordenar productos en lote (admin)
export const reorderProducts = async (req, res) => {
    try {
        const { items } = req.body
        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'items debe ser un array de { id, order }' })
        }

        const operations = items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { order: item.order } },
            },
        }))

        await ProductModel.bulkWrite(operations)
        res.status(200).json({ message: 'Orden de productos actualizado exitosamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
