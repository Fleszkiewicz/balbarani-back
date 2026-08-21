import express from 'express'
import {
    createCategory,
    getAllCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryControllers.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllCategories)
router.get('/:slug', getCategoryBySlug)

router.post('/', requireAuth, requireAdmin, createCategory)
router.put('/:id', requireAuth, requireAdmin, updateCategory)
router.delete('/:id', requireAuth, requireAdmin, deleteCategory)

export default router