import puppeteer from 'puppeteer'
import './Extensions/ElementHandle.js'

const browser = await puppeteer.launch({ headless: true, args: ["--window-size=1366,720", "--fast-start", "--disable-extensions", "--no-sandbox"] })

const LIBRARIES_VERSION = async (...args) => {
    const [page, user_, password_, page_load_2, page_load_1, sleep, version, isEnd] = args
    switch (version) {
        case '6480':
            return await Libary6480(page, user_, password_, page_load_2, page_load_1, sleep, isEnd)
        case '3040':
            return await Libary6480(page, user_, password_, page_load_2, page_load_1, sleep, isEnd)
        case '2024':
            return await Libary2024(page, user_, password_, page_load_2, page_load_1, sleep, isEnd)
        case '4048':
            return await Libary2024(page, user_, password_, page_load_2, page_load_1, sleep, isEnd)
        case '4300':
            return await Libary4300(page, user_, password_, page_load_2, page_load_1, sleep, isEnd)
    }
}

const URL_BY_VERSION = (version, ip) => {
    switch (version) {
        case '6480':
            return `http://${ip}/login.php`
        case '3040':
            return `http://${ip}/login.php`
        case '2024':
            return `http://${ip}/login.ssi`
        case '4048':
            return `http://${ip}/login.ssi`
        default:
            return `http://${ip}/login.php`
    }
}

const STATUS = {
    'DRIVE_STATUS': 'N.A.',
    'DRIVE_STATUS OKbuttonDriveBullet OK': 'OK',
    'Ready': 'OK',
    'Writing': 'OK',
    'Idle': 'OK',
    'Error': 'ERROR',
    'DEFAULT': 'WARNING'
}

const AccesPage = async (ip, user_, password_, version_, isEnd) => {
    const page = await browser.newPage()

    try {
        await page.goto(URL_BY_VERSION(version_, ip))
    } catch (e) {
        console.log(e)
        page.close()
        return {
            drivers: [{
                id: 'N.A.',
                status: 'N.A.',
                process: 'N.A.',
                powerfull: 'N.A.',
                serial: 'N.A.'
            }],
            criticals: [{ description: 'N.A' }]
        }
    }
    /* configurations */
    await page.setViewport({ width: 1366, height: 720 })

    const page_load_1 = page.waitForNavigation({ waitUntil: 'networkidle0' })
    const page_load_2 = page.waitForNavigation({ waitUntil: 'networkidle2' })
    const sleep = async (ms = 1000) => await new Promise(r => setTimeout(r, ms))
    /* Authenticate and user selected in list*/
    return await LIBRARIES_VERSION(page, user_, password_, page_load_2, page_load_1, sleep, version_, isEnd)
}

async function Libary6480(page, user_, password_, page_load_2, page_load_1, sleep, isEnd) {
    try { await page.waitForSelector('#slctAccount_chosen', { timeout: 5000 }) }
    catch (e) { }

    let div = await page.$('#slctAccount_chosen')
    div ??= await page.$('#slctAccount')

    if (div != null) {
        await div.click()
        const username = await page.$$('.group-option')
        for (let index = 0; index < username.length; index++) {
            const user = await (await username[index].getProperty('innerText')).jsonValue()
            if (user === (user_ || process.env.USERNAME_LIB))
                await username[index].click()
        }
    }

    await page.type('#logPwd', password_ || process.env.PASSWORD_LIB)
    const btn = await page.$('#BTNLOGIN')
    await btn.click()

    /* wait page load content */
    await page_load_2

    /* Click on button for view status*/
    await page.waitForSelector('#modStatus')
    const btn_status = await page.$('#modStatus')
    await btn_status.click()

    /* wait page load content */
    await page_load_1

    await sleep(3000)

    /* Click on button for view status drivers*/
    await page.waitForSelector('#pgStatusDriveSettings')
    const btn_driver_status = await page.$('#pgStatusDriveSettings')
    await btn_driver_status.click()

    /* wait page load content */
    await sleep(6000)

    await page.waitForSelector('#TBL_DRIVE')
    const table = await page.$('#TBL_DRIVE')

    /* verify if contain open class and close if open*/
    const open = await table.$('#drivenum > .expandable-field-section.open')
    if (open)
        await (await open.$('.open-close-button')).click()

    const columns = await table.$$('#drivenum')
    const list_ = await Promise.all(columns.map(async (row) => {
        let object = {}
        const div_log_num = await row.$('#DRIVE_LOG_NUM')
        const div_status = await row.$('#DRIVE_STATUS')
        const div_activity = await row.$('#DRIVE_ACTIVITY')
        const div_enable = await row.$('#DRIVE_ENABLED_HEAD')
        const div_serial = await row.$('#DRIVE_SERIAL_NO')

        const text_num = await (await div_log_num.getProperty('textContent')).jsonValue()
        const text_class = await (await div_status.getProperty('className')).jsonValue()
        const text_activity = await (await div_activity.getProperty('textContent')).jsonValue()
        const text_enable = await (await div_enable.getProperty('textContent')).jsonValue()
        const text_serial = await (await div_serial.getProperty('textContent')).jsonValue()

        object = {
            id: text_num,
            status: STATUS[text_class] || STATUS['DEFAULT'],
            process: text_activity === ' ' ? 'N.A.' : text_activity,
            powerfull: text_enable === ' ' ? 'N.A.' : text_enable,
            serial: text_serial === ' ' ? 'N.A.' : text_serial,
        }

        return object
    }))

    /* detect if exist critical error */
    const option = await page.$('#btnStackError')
    const isVisible = await option.isVisible()
    const criticals = []
    if (isVisible) {
        await option.click()

        await page_load_2
        await sleep(3000)

        await page.waitForSelector('#id_TicketLogTableContainer')
        const table = await page.$('#id_TicketLogTableContainer')
        const columns = await table.$$('#CloneTargetEventsContent > .container-row.divTableBody')

        const descriptions = await Promise.all(columns.map(async (row) => {
            const description = await row.$('div:nth-child(4)')
            const text_description = await (await description.getProperty('textContent')).jsonValue()
            return { description: text_description }
        }))

        criticals.push(...descriptions)
    } else { criticals.push({ description: 'N.A.' }) }

    if (isEnd) await browser.close()
    else await page.close()

    return { drivers: list_, criticals: criticals }
}

async function Libary2024(page, user_, password_, page_load_2, page_load_1, sleep, isEnd) {
    let ListDrivers = []

    await page.waitForSelector('#ButtonRegion')

    const div = await page.$('#ButtonRegion')
    div.evaluate(async (el) => { await el.children[1].click() })


    /* wait page load content */
    await page_load_2

    /* find frame and click on button respect */
    let frame = getFrame(page, 'tabs')

    /* click btn drive */
    await frame.$eval('#drive_information', element => element.click())

    await sleep(3000)

    /* get information Drive id, serial number of drive */
    let frame_main = getFrame(page, 'main')
    const list_ = await frame_main.$$eval('.dataTable', elements => {
        const list = []
        elements.forEach(element => {
            const id = element.querySelector('thead > tr > th:nth-child(2)')
            const serial = element.querySelector('tbody > tr:nth-child(3) > td:nth-child(2)')
            const id_string = id.textContent.split(' ')[0].trim()
            const serial_string = serial.textContent.trim()
            list.push({ id: id_string, serial: `S/N ${serial_string}` })
        })

        return list
    })

    ListDrivers.push(...list_)

    /* Click on button for view status*/
    await frame.$eval('#status', element => element.click())

    /* wait page load content */
    await frame.waitForSelector('#drive_status')
    await sleep(3000)

    /* click on btn status */
    await frame.$eval('#drive_status', element => element.click())

    /* wait page load content */
    await sleep(3000)

    frame_main = getFrame(page, 'main')
    const list__ = await frame_main.$$eval('.dataTable', elements => {
        const list = []
        elements.forEach(element => {
            const id = element.querySelector('thead > tr > th')
            const status = element.querySelector('tbody > tr:nth-child(1) > td:nth-child(2)')
            const process = element.querySelector('tbody > tr:nth-child(7) > td:nth-child(2)')
            const id_string = id.textContent.substring(8, 9).trim()
            const status_string = status.textContent.trim()
            const process_string = process.textContent.trim()
            list.push({ id: id_string, status: status_string, process: process_string, powerfull: 'N.A.' })
        })
        return list
    })

    list__.forEach(element => {
        const index = ListDrivers.findIndex(e => e.id === element.id)
        if (index !== -1) {
            ListDrivers[index].status = STATUS[element.status] || STATUS['DEFAULT']
            ListDrivers[index].process = element.process
            ListDrivers[index].powerfull = element.powerfull
        }
    })

    /* Verify if status error exist in library */
    const frame_left = getFrame(page, 'left')
    const errors = await frame_left.$eval('#greyPanel>table>tbody>tr:nth-child(4)>td:nth-child(2)', element => {
        console.log(element)
        const name_src = element.querySelector('img').getAttribute('src')
        const type_status = name_src.split('.')[0]
        const isError = type_status === 'status_error'
        if (isError) {
            const message_error = element.querySelector('a').textContent
            return [{ description: message_error }]
        }
        else { return [{ description: 'N.A.' }] }
    })

    if (isEnd) await browser.close()
    else await page.close()

    return { drivers: ListDrivers, criticals: errors }
}

async function Libary4300(page, user_, password_, page_load_2, page_load_1, sleep, isEnd) {
    const ListDrivers = []
    try { await page.waitForSelector('#slctAccount', { timeout: 5000 }) }
    catch (e) { console.log(e) }

    await page.type('#slctAccount', user_ || process.env.USERNAME_LIB)
    await page.type('#logPwd', password_ || process.env.PASSWORD_LIB)
    await page.click('#BTNLOGIN')

    /* wait page load content */
    await page_load_2

    await page.waitForSelector('#mnuDrives')
    const btn_drivers = await page.$('#mnuDrives')
    await btn_drivers.click()

    await page_load_1
    await sleep(3000)

    await page.waitForSelector('#TBL_DRIVE')
    const table = await page.$('#TBL_DRIVE')

    table.$$('#drivenum').then(rows => {
        rows.forEach(async (row) => {
            const div_log_num = await row.$('#DRIVE_LOG_NUM')
            const div_status = await row.$('#DRIVE_STATUS')
            const div_activity = await row.$('#DRIVE_ACTIVITY')
            const div_enable = await row.$('#DRIVE_ENABLED_HEAD')
            const div_serial = await row.$('#DRIVE_SERIAL_NO')

            const text_num = await (await div_log_num.getProperty('textContent')).jsonValue()
            const text_class = await (await div_status.getProperty('className')).jsonValue()
            const text_activity = await (await div_activity.getProperty('textContent')).jsonValue()
            const text_enable = await (await div_enable.getProperty('textContent')).jsonValue()
            const text_serial = await (await div_serial.getProperty('textContent')).jsonValue()

            ListDrivers.push({
                id: text_num,
                status: STATUS[text_class] || STATUS['DEFAULT'],
                process: text_activity === ' ' ? 'N.A.' : text_activity,
                powerfull: text_enable,
                serial: text_serial,
            })
        })
    })

    if (isEnd) await browser.close()
    else await page.close()

    return { drivers: ListDrivers, criticals: [{ description: 'N.A.' }] }
}

function getFrame(page, name) {
    const frame = page.frames().find(f => f.name() === name);
    if (frame) return frame;
    else return null;
}

export default AccesPage