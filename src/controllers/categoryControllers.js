import Category from '../models/CategoryModel.js'

// Crear categoría (admin)
export const createCategory = async (req, res) => {
    try {
        const category = new Category(req.body)
        await category.save()
        res.status(201).json(category)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Obtener todas las categorías activas, ordenadas
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ active: true }).sort({ order: 1 })
        res.status(200).json(categories)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Obtener una categoría por su slug (para la navegación del frontend)
export const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({
            slug: req.params.slug,
            active: true,
        })
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }
        res.status(200).json(category)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Actualizar categoría (admin)
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }
        Object.assign(category, req.body)
        await category.save() // pasa por el pre('save') y regenera el slug si cambió el name
        res.status(200).json(category)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Eliminar categoría (admin)
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }
        res.status(200).json({ message: 'Categoría eliminada' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}