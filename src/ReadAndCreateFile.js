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
        file.write('<html><head><title>Libraries</title></head><body>')
        file.write('<table>')

        file.write('</table>')
        file.write('</body></html>')
        file.end()
    })
}

/* Delete file created */
export function DeleteFile() {
}