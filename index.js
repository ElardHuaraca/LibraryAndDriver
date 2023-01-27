import AccesPage from './src/AccesPage.js'
import fs from 'fs'

/* read file json localy */
fs.readFile('./drivers.json', 'utf8', async (err, data) => {
})

const listDrivers = await AccesPage()

console.log(listDrivers)