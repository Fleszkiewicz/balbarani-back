import express from 'express'
import {
    createCategory,
    getAllCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryControllers.js'

const router = express.Router()

// Rutas públicas
router.get('/', getAllCategories)
router.get('/:slug', getCategoryBySlug)

// Rutas protegidas (admin)
router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

export default router