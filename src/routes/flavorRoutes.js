import { Router } from 'express'
import {
    getFlavors,
    createFlavor,
    updateFlavor,
    deleteFlavor,
} from '../controllers/flavorController.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// Rutas públicas (para leer en la tienda)
router.get('/', getFlavors)

// Rutas protegidas (para admin)
router.post('/', requireAuth, requireAdmin, createFlavor)
router.put('/:id', requireAuth, requireAdmin, updateFlavor)
router.delete('/:id', requireAuth, requireAdmin, deleteFlavor)

export default router
