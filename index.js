import AccesPage from './src/AccesPage.js'
import { ReadFileFromJson, WriteFile } from './src/ReadAndCreateFile.js'
import SMTPMail from './src/SMTPMail.js'
import dotenv from 'dotenv'

dotenv.config()
/* read file json localy */
const libraries = ReadFileFromJson()

/* Loop array content and get information by library */
const array = await Promise.all(
    libraries.map(async (library) => {
        return { library: library, drivers: await AccesPage(library.ip, library.user, library.password) }
    })
)

await WriteFile(array)

await SMTPMail()
