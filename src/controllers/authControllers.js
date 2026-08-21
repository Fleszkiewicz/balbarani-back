import { registerSchema, loginSchema } from '../schemas/authSchema.js'
import UserModel from '../models/UserModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ZodError } from 'zod'

export const registerUser = async (req, res) => {
    try {
        // traer la clave secreta de JWT
        const JWT_SECRET = process.env.JWT_SECRET

        //extraer los datos del usuario
        const { username, email, password } = registerSchema.parse(req.body)

        //comprobar si ya existe el usuario
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' })
        }

        //encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10)

        //comprobar el usuario admin
        const isFirsUser = (await UserModel.countDocuments()) === 0

        //crear usuario y guardar en DB
        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            isAdmin: isFirsUser,
        })

        //generar token con json web token (JWT)
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
            expiresIn: '1h',
        })

        //header.payload.signature
        //enviar token como una cookie
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', //true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //lax
            maxAge: 60 * 60 * 1000, //1 hora
        })
            .status(201)
            .json({ message: 'Usuario registrado exitosamente' })
    } catch (error) {
        console.error('Error en registerUser:', error)
        // Enviar info limitada al cliente y loguear stack para debug
        res.status(500).json({
            message: 'Error interno en el servidor',
            error: error.message,
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        //Obtener la clave secreta del entorno
        const JWT_SECRET = process.env.JWT_SECRET

        //Extraer el email y constraseña del cuerpo de la peticion
        //ademas valodarlos
        const { email, password } = loginSchema.parse(req.body)

        // buscar el usuario por email
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' })
        }

        //comparar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credenciales inválidas' })
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            {
                expiresIn: '1h',
            },
        )

        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        }

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
        })
            .status(200)
            .json(userData)
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        res.status(500).json({
            message: 'Error al iniciar sesión',
            error: error,
        })
    }
}

export const profile = async (req, res) => {
    //Extraer el accessToken enviado por el cliente
    const token = req.cookies.accessToken
    try {
        //verificar o decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //buscar el usuario en la db
        const user = await UserModel.findById(decoded.userId)
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        res.status(200).json({
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            username: user.username,
        })
    } catch (error) {
        res.status(401).json({ message: 'No autorizado' })
    }
    return {
        user: 'test user',
    }
}

export const logout = (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
        .status(200)
        .json({ message: 'Sesión cerrada exitosamente' })
}
