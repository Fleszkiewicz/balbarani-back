import express from 'express'
import {
    createProduct,
    updateProduct,
    getProductById,
    getAllProducts,
    deleteProducts,
    reorderProducts,
} from '../controllers/productsControllers.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllProducts)
router.get('/:id', getProductById)

router.post('/', requireAuth, requireAdmin, createProduct)

// Ruta de reordenamiento antes de /:id
router.put('/reorder', requireAuth, requireAdmin, reorderProducts)

router.put('/:id', requireAuth, requireAdmin, updateProduct)
router.delete('/:id', requireAuth, requireAdmin, deleteProducts)

export default router