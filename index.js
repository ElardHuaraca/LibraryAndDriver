import AccesPage from './src/AccesPage.js'
import { ReadFileFromJson, WriteFile } from './src/ReadAndCreateFile.js'
import SMTPMail from './src/SMTPMail.js'
import dotenv from 'dotenv'
import { EventEmitter } from 'events'

EventEmitter.setMaxListeners(0)

dotenv.config()
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

/*
await Promise.all(
    libraries.map(async (library, index) => {
        const version_ = library.name.split('_')[0].slice(3)
        const drivers = await AccesPage(library.ip, library.user, library.password, version_, index == libraries.lenght)
        return { library: this, drivers: drivers }
    })
)
 */
await WriteFile(array)

await SMTPMail()

/* exit */
process.exit(0)