import AccesPage from './src/AccesPage.js'
import { ReadFile, WriteFile } from './src/ReadAndCreateFile.js'

/* read file json localy */
const libraries = ReadFile()

/* Loop array content and get information by library */
const array = await Promise.all(
    libraries.map(async (library) => {
        return { library: library, drivers: await AccesPage(library.ip) }
    })
)

WriteFile(array)
