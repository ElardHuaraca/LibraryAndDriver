import fs from 'fs'

const FILENAME = "libraries.html"

export function ReadFile() {
    const file = fs.readFileSync(FILENAME)
    return file.toString()
}

/* Read File libraries.json localy in project */
export function ReadFileFromJson() {
    const string_content = fs.readFileSync('libraries.json').toString()
    return JSON.parse(string_content)
}

/* Write new file .html and content libraries information */
export async function WriteFile(listLibrary) {
    /* detect if exist file */
    if (fs.existsSync(FILENAME)) DeleteFile()

    const file = fs.createWriteStream(FILENAME)
    file.on('ready', () => {
        file.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Libraries</title></head><body>')
        file.write('<table style="border-collapse:collapse; width:100%;text-align:center;" border="1">')
        file.write('<thead><tr><th scope="col">Libreria</th><th scope="col">Drives</th><th scope="col">Serial</th><th scope="col">Tipo de Cinta</th><th scope="col">Estatus</th><th scope="col">Proceso</th><th scope="col">On/Of</th><th scope="col">MSG Criticos</th><th scope="col">IP</th></tr></thead>')
        file.write('<tbody>')
        listLibrary.forEach((item) => {
            const { library, library_data } = item
            file.write(`<tr><td rowspan="${library_data.drivers.length}">${library.name}</td>`)

            const rangesAndType = LIST_MAGENETIC_TAPE(library.drivers || [])

            library_data.drivers.forEach((driver, index) => {
                if (index > 0) file.write('<tr>')
                const type = TYPE_MAGENETIC_TAPE(driver.id, rangesAndType)
                file.write(`<td>Drive ${driver.id}</td>`)
                file.write(`<td>${driver.serial}</td>`)
                file.write(`<td>${type}</td>`)
                file.write(`<td>${driver.status}</td>`)
                file.write(`<td>${driver.process}</td>`)
                file.write(`<td>${driver.powerfull}</td>`)
                if (index == 0) {
                    file.write(`<td rowspan="${library_data.drivers.length}">`)
                    library_data.criticals.forEach((critical) => {
                        file.write(`${critical.description} <br>`)
                    })
                    file.write('</td>')
                    file.write(`<td rowspan="${library_data.drivers.length}"><a href="http://${library.ip}">${library.ip}</a></td>`)
                }
                file.write('</tr>')
            })
        })
        file.write('</tbody>')
        file.write('</table></body></html>')
        file.end()
    })

    await new Promise((r) => { setTimeout(r, 10) })
}

export function DeleteFile() {
    fs.unlinkSync(FILENAME)
}

const LIST_MAGENETIC_TAPE = (list) => {
    let first = 0
    return list.map((item) => {
        const itemSplit = item.split('=')
        const includes = itemSplit[0].includes('*')
        const indice = includes ? itemSplit[0].indexOf('*') : itemSplit[0].indexOf(' ')
        const last = itemSplit[0].slice(indice + 1, itemSplit[0].length)
        const lastRange = includes ? Number(last) + first : Number(last)
        const firstRange = first + 1
        first = lastRange
        return {
            firstRange: firstRange,
            lastRange: lastRange,
            type: itemSplit[1]
        }
    })
}

const TYPE_MAGENETIC_TAPE = (id, rangesAndType) => {
    if (rangesAndType.length === 0) return 'N.A.'
    const type = rangesAndType.find(({ firstRange, lastRange }) => firstRange <= Number(id) & Number(id) <= lastRange)
    return type ? type.type : 'N.A.'
}