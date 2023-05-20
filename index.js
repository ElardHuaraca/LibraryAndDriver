import AccesPage from './src/AccesPage.js'
import { ReadFileFromJson, WriteFile } from './src/ReadAndCreateFile.js'
import SMTPMail from './src/SMTPMail.js'
import dotenv from 'dotenv'
import { EventEmitter } from 'events'
import cron from 'node-cron'

EventEmitter.setMaxListeners(0)

dotenv.config()

cron.schedule('0 8 * * *', async () => { await app() })
cron.schedule('0 13 * * *', async () => { await app() })
cron.schedule('0 17 * * *', async () => { await app() })
cron.schedule('0 23 * * *', async () => { await app() })

const app = async () => {

    console.log('Start app')

    /* read file json localy */
    const libraries = ReadFileFromJson()
    const array = []

    /* Loop array content and get information by library */
    for (let [index, library] of libraries.entries()) {
        const isEnd = index + 1 === libraries.length
        const version_ = library.name.split('_')[0].slice(3)
        const library_data = await AccesPage(library.ip, library.user, library.password, version_, isEnd)
        array.push({ library: library, library_data: library_data })
    }

    await WriteFile(array)

    await SMTPMail()

    console.log('End app')
}
