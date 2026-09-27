import { Router } from 'express'
import { getDeliveryFee, updateDeliveryFee } from '../controllers/settingControllers.js'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/delivery-fee', getDeliveryFee)
router.put('/delivery-fee', requireAuth, requireAdmin, updateDeliveryFee)

export default router
