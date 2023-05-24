import SMTPMail from './src/SMTPMail.js'
import dotenv from 'dotenv'
import { EventEmitter } from 'events'
import cron from 'node-cron'
import { AccesPage } from './src/AccesPage.js'
import { ReadFileFromJson, WriteFile } from './src/ReadAndCreateFile.js'

EventEmitter.setMaxListeners(0)

dotenv.config()

cron.schedule('0 0 8 * * *', async () => { await app() })
cron.schedule('0 0 13 * * *', async () => { await app() })
cron.schedule('0 0 17 * * *', async () => { await app() })
cron.schedule('0 0 23 * * *', async () => { await app() })

let start = false
const taskExample = cron.schedule('* * * * * *', async () => {
    if (start) return

    start = true
    await app()
    taskExample.stop()
}, { scheduled: false })



const app = async () => {

    console.log('Start app', getDate())

    /* read file json localy */
    const libraries = ReadFileFromJson()
    const array = []

    /* Loop array content and get information by library */
    for (let [_, library] of libraries.entries()) {
        const version_ = library.name.split('_')[0].slice(3)
        const library_data = await AccesPage(library.ip, library.user, library.password, version_)
        array.push({ library: library, library_data: library_data })
    }

    await WriteFile(array)

    await SMTPMail()

    console.log('End app', getDate())
}

const getDate = () => {
    const date = new Date()
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${day}/${month}/${year} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

taskExample.start()