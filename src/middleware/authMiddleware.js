import jwt from 'jsonwebtoken'
import UserModel from '../models/UserModel.js'

export const requireAuth = async (req, res, next) => {
    const token = req.cookies.accessToken

    if (!token) {
        return res.status(401).json({ message: 'No autorizado' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await UserModel.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({ message: 'No autorizado' })
        }

        req.user = user
        next()
    } catch {
        return res.status(401).json({ message: 'No autorizado' })
    }
}

export const requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado' })
    }
    next()
}
