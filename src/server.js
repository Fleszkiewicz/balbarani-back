import express from 'express'
import { connectDB, disconnectDB } from './config/configdb.js'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productsRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import categoryRoutes from './routes/categoryRoutes.js'
import subcategoryRoutes from './routes/subcategoryRoutes.js'
import flavorRoutes from './routes/flavorRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import settingRoutes from './routes/settingRoutes.js'

dotenv.config()

const app = express()

// capturar errores no manejados para debugging
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION', err)
})
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason)
})

const PORT = process.env.PORT || 3000

app.use(
    cors({
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cookie',
            'Set-Cookie',
        ],
        credentials: true,
    })
)

app.use(express.json())
app.use(cookieParser())

//Rutas API
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/subcategories', subcategoryRoutes)
app.use('/api/flavors', flavorRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/settings', settingRoutes)

//Primero se conecta a la DB y luego al Puerto
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅-Servidor corriendo en puerto ${PORT}`)
        })
        //Puerto escuchando
        //node --watch src/server.js
    })
    .catch(() => {
        disconnectDB()
    })
