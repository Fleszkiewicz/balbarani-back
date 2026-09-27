import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderControllers.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

//crear orden (clientes)
router.post('/', requireAuth, createOrder);

//Rutas de admin
router.get('/', requireAuth, requireAdmin, getOrders);
router.put('/:id/status', requireAuth, requireAdmin, updateOrderStatus);

export default router;
