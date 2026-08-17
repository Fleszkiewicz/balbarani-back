import express from 'express'
import {
    createSubcategory,
    getSubcategoriesByCategory,
    updateSubcategory,
    deleteSubcategory,
} from '../controllers/subcategoryControllers.js'

const router = express.Router()

// Rutas públicas
router.get('/by-category/:categorySlug', getSubcategoriesByCategory)

// Rutas protegidas (admin)
router.post('/', createSubcategory)
router.put('/:id', updateSubcategory)
router.delete('/:id', deleteSubcategory)

export default router