import Subcategory from '../models/SubcategoryModel.js'
import Category from '../models/CategoryModel.js'

// Crear subcategoría (admin)
export const createSubcategory = async (req, res) => {
    try {
        const subcategory = new Subcategory(req.body)
        await subcategory.save()
        res.status(201).json(subcategory)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Obtener subcategorías de una categoría puntual (por slug de la categoría)
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.categorySlug })
        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }
        const subcategories = await Subcategory.find({
            category: category._id,
            active: true,
        }).sort({ order: 1 })
        res.status(200).json(subcategories)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Actualizar subcategoría (admin)
export const updateSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id)
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategoría no encontrada' })
        }
        Object.assign(subcategory, req.body)
        await subcategory.save()
        res.status(200).json(subcategory)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// Eliminar subcategoría (admin)
export const deleteSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.findByIdAndDelete(req.params.id)
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategoría no encontrada' })
        }
        res.status(200).json({ message: 'Subcategoría eliminada' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}