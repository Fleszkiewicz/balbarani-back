import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus, getMyOrders } from '../controllers/orderControllers.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Ruta para que el cliente logueado consulte sus compras
router.get('/my-orders', requireAuth, getMyOrders);

//crear orden (clientes)
router.post('/', requireAuth, createOrder);

//Rutas de admin
router.get('/', requireAuth, requireAdmin, getOrders);
router.put('/:id/status', requireAuth, requireAdmin, updateOrderStatus);

export default router;
