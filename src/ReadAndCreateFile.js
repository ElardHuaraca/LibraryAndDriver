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
export function WriteFile(listLibrary) {
    const file = fs.createWriteStream('libraries.html')
    file.on('ready', () => {
        file.write('<table style="border-collapse:collapse; width:100%" border="1">')
        file.write('<thead><tr><th scope="col">Libreria</th><th scope="col">Drives</th><th scope="col">Estatus</th><th scope="col">Proceso</th><th scope="col">IP</th></tr></thead>')
        file.write('<tbody class="text-align:center">')
        listLibrary.forEach((item) => {
            const { library, drivers } = item
            file.write(`<tr><td rowspan="${drivers.length}" class="align-middle">${library.name}</td>`)
            drivers.forEach((driver, index) => {
                if (index > 0) file.write('<tr>')
                file.write(`<td>Drive ${driver.id}</td>`)
                file.write(`<td>${driver.status}</td>`)
                file.write(`<td>${driver.process}</td>`)
                if (index == 0) file.write(`<td rowspan="${drivers.length}" class="align-middle"><a href="http://${library.ip}">${library.ip}</a></td>`)
                file.write('</tr>')
            })
        })
        file.write('</tbody>')
        file.write('</table>')
        file.end()
    })
}

export function DeleteFile(filename) {
    fs.unlinkSync(filename)
}
