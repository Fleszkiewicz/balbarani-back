import express from 'express'
import {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProducts,
} from '../controllers/productsControllers.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllProducts)
router.get('/:id', getProductById)

router.post('/', requireAuth, requireAdmin, createProduct)
router.put('/:id', requireAuth, requireAdmin, updateProduct)
router.delete('/:id', requireAuth, requireAdmin, deleteProducts)

export default router