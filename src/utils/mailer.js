import nodemailer from 'nodemailer'

export const sendEmail = async ({ to, subject, html, text }) => {
    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS

    // Si todavía no hay credenciales configuradas en el .env, lo mostramos en consola
    if (!user || !pass) {
        console.log('\n' + '='.repeat(50))
        console.log('📨 [MODO SIMULADOR DE EMAIL]')
        console.log(`Para: ${to}`)
        console.log(`Asunto: ${subject}`)
        if (text) console.log(`Contenido:\n${text}`)
        console.log('='.repeat(50) + '\n')
        return { success: true, simulated: true }
    }

    // Si ya configuraste el .env, envía el correo real por Gmail/SMTP
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        })

        await transporter.sendMail({
            from: `"Heladería Balbarani" <${user}>`,
            to,
            subject,
            text,
            html,
        })

        return { success: true }
    } catch (error) {
        console.error('Error enviando email real:', error)
        // Fallback a consola por si falló la contraseña de app
        console.log(`📨 [FALLBACK CONSOLA] Para: ${to} | Asunto: ${subject} | ${text}`)
        return { success: false, error: error.message }
    }
}
