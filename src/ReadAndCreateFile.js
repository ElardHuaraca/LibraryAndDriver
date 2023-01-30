import fs from 'fs'

/* Read File libraries.json localy in project */
export function ReadFile() {
    const string_content = fs.readFileSync('libraries.json').toString()
    return JSON.parse(string_content)
}

/* Write new file .html and content libraries information */
export function WriteFile() {
}

/* Delete file created */
export function DeleteFile() {
}