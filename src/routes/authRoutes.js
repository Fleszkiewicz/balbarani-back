import express from 'express'
import { profile, registerUser, loginUser, logout, verifyEmail, resendVerificationCode, forgotPassword, resetPassword } from '../controllers/authControllers.js'


const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logout)
router.get('/profile', profile)

// Rutas de verificación y recuperación
router.post('/verify-email', verifyEmail)
router.post('/resend-code', resendVerificationCode)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router
