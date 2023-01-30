import nodemailer from 'nodemailer'
import { ReadFile, DeleteFile } from './ReadAndCreateFile.js'

const smtpMail = async () => {

    let transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_SMTP,
            pass: process.env.PASSWORD_SMTP
        }
    })

    await transporter.sendMail({
        from: process.env.EMAIL_SMTP,
        to: process.env.EMAIL_SMTP,
        subject: 'TEST REPORTE LIBRERIAS',
        html: ReadFile('libraries.html')
    })

    DeleteFile('libraries.html')
}

export default smtpMail