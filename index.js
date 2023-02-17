import AccesPage from './src/AccesPage.js'
import { ReadFileFromJson, WriteFile } from './src/ReadAndCreateFile.js'
import SMTPMail from './src/SMTPMail.js'
import dotenv from 'dotenv'
import { EventEmitter } from 'events'

EventEmitter.setMaxListeners(0)

dotenv.config()
/* read file json localy */
const libraries = ReadFileFromJson()

/* Loop array content and get information by library */
const array = await Promise.all(
    libraries.map(async (library) => {
        const version_ = library.name.split('_')[0].slice(3)
        return { library: library, drivers: await AccesPage(library.ip, library.user, library.password, version_) }
    })
)

await WriteFile(array)

await SMTPMail()

/* exit */
process.exit(0)