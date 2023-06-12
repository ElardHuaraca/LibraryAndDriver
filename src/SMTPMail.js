import nodemailer from 'nodemailer'
import { ReadFile } from './ReadAndCreateFile.js'

const smtpMail = async () => {

    let transporter = nodemailer.createTransport({
        host: '10.100.13.31',
        port: 25
    })

    let count = 0

    do {
        await transporter.sendMail({
            from: process.env.EMAIL_SMTP,
            to: process.env.FROM_SMTP,
            subject: 'REPORTE LIBRERIAS ROBOTICAS',
            html: ReadFile()
        }).then((_) => { count = 0 }).catch((error) => {
            console.log(error)
            count++
        })

        console.log('Try send email: ' + count)

    } while (count <= 4 & count >= 1)
}

export default smtpMail