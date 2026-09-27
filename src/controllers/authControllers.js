import { registerSchema, loginSchema } from '../schemas/authSchema.js'
import UserModel from '../models/UserModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ZodError } from 'zod'
import { sendEmail } from '../utils/mailer.js'


export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = registerSchema.parse(req.body)

        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const isFirstUser = (await UserModel.countDocuments()) === 0

        // Generamos un código de 6 dígitos aleatorio
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            isAdmin: isFirstUser,
            isVerified: isFirstUser, // Si es el primer usuario (admin) lo auto-verificamos
            verificationCode: isFirstUser ? null : verificationCode,
            verificationCodeExpires: isFirstUser ? null : verificationCodeExpires,
        })

        // Enviamos el correo (o simulador en consola)
        if (!isFirstUser) {
            await sendEmail({
                to: email,
                subject: 'Tu código de verificación - Balbarani',
                text: `¡Hola ${username}! Tu código de verificación para activar tu cuenta es: ${verificationCode}. Expira en 15 minutos.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">¡Bienvenido a Heladería Balbarani!</h2>
                        <p>Tu código de verificación de 6 dígitos es:</p>
                        <h1 style="background: #e2e8f0; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 8px;">${verificationCode}</h1>
                        <p style="color: #666; font-size: 12px;">Este código expira en 15 minutos.</p>
                    </div>
                `,
            })
        }

        return res.status(201).json({
            message: 'Usuario registrado. Por favor verifica tu correo.',
            email: newUser.email,
            requiresVerification: !isFirstUser,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: 'Datos inválidos', errors: error.errors })
        }
        res.status(500).json({ message: 'Error interno del servidor', error: error.message })
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


// Verificar el código de registro y activar la cuenta
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body
        const JWT_SECRET = process.env.JWT_SECRET

        if (!email || !code) {
            return res.status(400).json({ message: 'El email y el código son requeridos' })
        }

        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'La cuenta ya ha sido verificada' })
        }

        if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
            return res.status(400).json({ message: 'Código incorrecto o vencido' })
        }

        // Activamos al usuario y limpiamos el código
        user.isVerified = true
        user.verificationCode = null
        user.verificationCodeExpires = null
        await user.save()

        // Creamos la sesión para que quede logueado automáticamente
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' })

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
        }).status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
        })
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar email', error: error.message })
    }
}

// Reenviar código de verificación
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body
        const user = await UserModel.findOne({ email })

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
        if (user.isVerified) return res.status(400).json({ message: 'La cuenta ya está verificada' })

        const newCode = Math.floor(100000 + Math.random() * 900000).toString()
        user.verificationCode = newCode
        user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000)
        await user.save()

        await sendEmail({
            to: email,
            subject: 'Nuevo código de verificación - Balbarani',
            text: `Tu nuevo código de verificación es: ${newCode}. Expira en 15 minutos.`,
        })

        res.status(200).json({ message: 'Nuevo código enviado exitosamente' })
    } catch (error) {
        res.status(500).json({ message: 'Error al reenviar código', error: error.message })
    }
}

// Solicitar código para restablecer contraseña
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'No existe ninguna cuenta asociada a este correo' })
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
        user.resetPasswordCode = resetCode
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)
        await user.save()

        await sendEmail({
            to: email,
            subject: 'Recuperar contraseña - Heladería Balbarani',
            text: `Tu código para recuperar tu contraseña es: ${resetCode}. Expira en 15 minutos.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                    <h2>Recuperación de Contraseña</h2>
                    <p>Ingresá este código en la aplicación para restablecer tu clave:</p>
                    <h1 style="background: #fed7aa; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 8px;">${resetCode}</h1>
                    <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, ignorá este mensaje.</p>
                </div>
            `,
        })

        res.status(200).json({ message: 'Código de recuperación enviado' })
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar recuperación', error: error.message })
    }
}

// Cambiar la contraseña con el código
export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' })
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' })
        }

        const user = await UserModel.findOne({ email })
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

        if (user.resetPasswordCode !== code || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'El código es incorrecto o ha vencido' })
        }

        // Hasheamos la nueva contraseña y limpiamos el código
        user.password = await bcrypt.hash(newPassword, 10)
        user.resetPasswordCode = null
        user.resetPasswordExpires = null
        await user.save()

        res.status(200).json({ message: 'Contraseña actualizada con éxito. Ya podés iniciar sesión.' })
    } catch (error) {
        res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message })
    }
}
