import AccesPage from './src/AccesPage.js'
import { ReadFile } from './src/ReadAndCreateFile.js'

/* read file json localy */
const libraries = ReadFile()

libraries.forEach(async (library) => {
    const listDrivers = await AccesPage(library.ip)
})
