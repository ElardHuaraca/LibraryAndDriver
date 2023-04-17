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
        to: process.env.FROM_SMTP,
        subject: 'REPORTE LIBRERIAS ROBOTICAS',
        html: ReadFile()
    }).catch((error) => {
        console.log(error)
    })
}

export default smtpMail