import SMTPMail from './src/SMTPMail.js'
import dotenv from 'dotenv'
import { EventEmitter } from 'events'
import { schedule } from 'node-cron'
import { AccesPage } from './src/AccesPage.js'
import { ReadFileFromJson, WriteFile } from './src/ReadAndCreateFile.js'

EventEmitter.setMaxListeners(0)

dotenv.config()

const times = ['8', '13', '17', '23']

const mainTask = schedule('* * * * * *', async () => {
    const hour = new Date().getHours().toString()
    if (!times.includes(hour)) return
    await app()
}, { scheduled: false })

let start = false
const taskExample = schedule('* * * * * *', async () => {
    if (!start) {
        start = true
        await app()
        taskExample.stop()
    }

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

mainTask.start()
taskExample.start()