import fs from 'fs'

const FILENAME = "libraries.html"

export function ReadFile() {
    return fs.readFileSync(FILENAME).toString()
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
        file.write('<thead><tr><th scope="col">Libreria</th><th scope="col">Drives</th><th scope="col">Serial</th><th scope="col">Estatus</th><th scope="col">Proceso</th><th scope="col">On/Of</th><th scope="col">MSG Criticos</th><th scope="col">IP</th></tr></thead>')
        file.write('<tbody>')
        listLibrary.forEach((item) => {
            const { library, library_data } = item
            file.write(`<tr><td rowspan="${library_data.drivers.length}">${library.name}</td>`)

            library_data.drivers.forEach((driver, index) => {
                if (index > 0) file.write('<tr>')
                file.write(`<td>Drive ${driver.id}</td>`)
                file.write(`<td>${driver.serial}</td>`)
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
