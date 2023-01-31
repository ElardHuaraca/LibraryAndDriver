import fs from 'fs'

export function ReadFile(filename) {
    return fs.readFileSync(filename).toString()
}

/* Read File libraries.json localy in project */
export function ReadFileFromJson() {
    const string_content = fs.readFileSync('libraries.json').toString()
    return JSON.parse(string_content)
}

/* Write new file .html and content libraries information */
export async function WriteFile(listLibrary) {
    const file = fs.createWriteStream('libraries.html')
    file.on('ready', () => {
        file.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Libraries</title></head><body>')
        file.write('<table style="border-collapse:collapse; width:100%;text-align:center;" border="1">')
        file.write('<thead><tr><th scope="col">Libreria</th><th scope="col">Drives</th><th scope="col">Estatus</th><th scope="col">Proceso</th><th scope="col">IP</th></tr></thead>')
        file.write('<tbody>')
        listLibrary.forEach((item) => {
            const { library, drivers } = item
            file.write(`<tr><td rowspan="${drivers.length}">${library.name}</td>`)
            drivers.forEach((driver, index) => {
                if (index > 0) file.write('<tr>')
                file.write(`<td>Drive ${driver.id}</td>`)
                file.write(`<td>${driver.status}</td>`)
                file.write(`<td>${driver.process}</td>`)
                if (index == 0) file.write(`<td rowspan="${drivers.length}"><a href="http://${library.ip}">${library.ip}</a></td>`)
                file.write('</tr>')
            })
        })
        file.write('</tbody>')
        file.write('</table></body></html>')
        file.end()
    })

    await new Promise((r) => { setTimeout(r, 10) })
}

export function DeleteFile(filename) {
    fs.unlinkSync(filename)
}
