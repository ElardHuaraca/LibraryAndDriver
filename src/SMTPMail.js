import nodemailer from 'nodemailer'
import { ReadFile } from './ReadAndCreateFile.js'

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

    let count = 0

    do {
        transporter.sendMail({
            from: process.env.EMAIL_SMTP,
            to: process.env.FROM_SMTP,
            subject: 'REPORTE LIBRERIAS ROBOTICAS',
            html: ReadFile()
        }).then((_) => { count = 0 }).catch((error) => {
            console.log(error)
            count++
        })

    } while (count <= 4 & count >= 1)
}

export default smtpMail