import express from 'express'
import {
    addToCart,
    getCart,
    updateCart,
    removeProductFromCart,
    clearCart,
    getCartTotal,
} from '../controllers/cartControllers.js'

const router = express.Router()

router.post('/add', addToCart)
router.get('/get/:userId', getCart)
router.put('/update/:userId', updateCart)
router.delete('/delete/:userId', removeProductFromCart)
router.delete('/clear/:userId', clearCart)
router.get('/total/:userId', getCartTotal)

export default router
