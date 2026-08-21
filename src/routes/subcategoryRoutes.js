import express from 'express'
import {
    createSubcategory,
    getSubcategoriesByCategory,
    updateSubcategory,
    deleteSubcategory,
} from '../controllers/subcategoryControllers.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/by-category/:categorySlug', getSubcategoriesByCategory)

router.post('/', requireAuth, requireAdmin, createSubcategory)
router.put('/:id', requireAuth, requireAdmin, updateSubcategory)
router.delete('/:id', requireAuth, requireAdmin, deleteSubcategory)

export default router