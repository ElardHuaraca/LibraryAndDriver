import puppeteer from 'puppeteer'
import './Extensions/ElementHandle.js'

const LIBRARIES_VERSION = async (...args) => {
    const [page, user_, password_, sleep, version] = args
    switch (version) {
        case '6480':
            console.log('version 6480')
            return await Libary6480(page, user_, password_, sleep)
        case '3040':
            console.log('version 3040')
            return await Libary6480(page, user_, password_, sleep)
        case '2024':
            console.log('version 2024')
            return await Libary2024(page, user_, password_, sleep)
        case '4048':
            console.log('version 4048')
            return await Libary2024(page, user_, password_, sleep)
        case '4300':
            console.log('version 4300')
            return await Libary4300(page, user_, password_, sleep)
        case '4500':
            console.log('version 4500')
            return await Libary4300(page, user_, password_, sleep)
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
        case '4500':
            return `http://${ip}/web`
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
    'Online': 'OK',
    'Unloading': 'OK',
    'Error': 'ERROR',
    'DEFAULT': 'WARNING'
}

const browser = await puppeteer.launch({ args: ["--window-size=1366,720", "--fast-start", "--disable-extensions", "--no-sandbox"] })

const AccesPage = async (ip, user_, password_, version_) => {
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

    const sleep = async (ms = 1000) => await new Promise(r => setTimeout(r, ms))
    /* Authenticate and user selected in list*/
    return await LIBRARIES_VERSION(page, user_, password_, sleep, version_)
}

async function Libary6480(page, user_, password_, sleep) {
    try { await page.waitForSelector('#slctAccount_chosen', { timeout: 5000 }) }
    catch (e) { console.log(e) }

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
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    /* Click on button for view status*/
    await page.waitForSelector('#modStatus')
    const btn_status = await page.$('#modStatus')
    await btn_status.click()

    /* wait page load content */
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

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

        await page.waitForNavigation({ waitUntil: 'networkidle2' })
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

    await page.close()

    return { drivers: list_, criticals: criticals }
}

async function Libary2024(page, user_, password_, sleep) {
    let ListDrivers = []

    await page.waitForSelector('#ButtonRegion')

    const div = await page.$('#ButtonRegion')
    div.evaluate(async (el) => { await el.children[1].click() })


    /* wait page load content */
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

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
        const name_src = element.querySelector('img').getAttribute('src')
        const type_status = name_src.split('.')[0]
        const isError = type_status === 'status_error'
        if (isError) {
            const message_error = element.querySelector('a').textContent
            return [{ description: message_error }]
        }
        else { return [{ description: 'N.A.' }] }
    })

    await page.close()

    return { drivers: ListDrivers, criticals: errors }
}

async function Libary4300(page, user_, password_, sleep) {
    const ListDrivers = []
    try {
        await page.waitForSelector('#slctAccount', { timeout: 5000 })
        await page.waitForSelector('#form', { timeout: 5000 })
    }
    catch (e) { console.log(e) }

    let inputUser = await page.$('#slctAccount')
    inputUser ??= await page.$('#user')

    let inputPassword = await page.$('#logPwd')
    inputPassword ??= await page.$('#password')

    let btnLogin = await page.$('#BTNLOGIN')
    btnLogin ??= await page.$('#loginSet')

    await inputUser.type(user_ || process.env.USERNAME_LIB)
    await inputPassword.type(password_ || process.env.PASSWORD_LIB)
    await btnLogin.click('#BTNLOGIN')

    try {
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
    }
    catch (e) {
        console.log(e)
        await page.close()
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

    try {
        await page.waitForSelector('#mnuDrives', { timeout: 5000 })
        await page.waitForSelector('#evo_widget_TBFisheyeItem_2', { timeout: 5000 })
    } catch (e) { console.log(e) }

    let btn_drivers = await page.$('#mnuDrives')
    btn_drivers ??= await page.$('#evo_widget_TBFisheyeItem_2')
    await btn_drivers.click()

    await sleep(3000)

    try {
        await page.waitForSelector('#TBL_DRIVE')
        await page.waitForSelector('.dojoxGridView div div div')
    } catch (e) { console.log(e) }

    let table = await page.$('#TBL_DRIVE')

    if (table !== null) {
        const rows = await table.$$('#drivenum')

        const list = await Promise.all(rows.map(async (row) => {
            const div_log_num = await row.$('#DRIVE_LOG_NUM')
            const div_status = await row.$('#DRIVE_STATUS')
            const div_activity = await row.$('#DRIVE_ACTIVITY')
            const div_enable = await row.$('#DRIVE_ENABLED_HEAD')
            const div_serial = await row.$('#DRIVE_SERIAL_NO')

            const text_num = await (await div_log_num.getProperty('textContent')).jsonValue()
            const text_class = await (await div_status.getProperty('className')).jsonValue()
            let text_activity = await (await div_activity.getProperty('textContent')).jsonValue()
            const text_enable = await (await div_enable.getProperty('textContent')).jsonValue()
            const text_serial = await (await div_serial.getProperty('textContent')).jsonValue()

            const cartridge = await row.$('.field-section-body > div > div:nth-child(1) > div:nth-child(5) > div:nth-child(4) > label')
            const text_cartridge = await (await cartridge.getProperty('textContent')).jsonValue()
            text_activity = text_cartridge === 'N/A' ? text_activity : text_cartridge

            return {
                id: text_num,
                status: STATUS[text_class] || STATUS['DEFAULT'],
                process: text_activity === ' ' ? 'N.A.' : text_activity,
                powerfull: text_enable,
                serial: text_serial,
            }
        }))

        ListDrivers.push(...list)
    } else {
        table ??= await page.$('.dojoxGridView div div div')
        const rows = await table.$$('.dojoxGridRow tr')

        let index = 0

        const list = await Promise.all(rows.map(async (row) => {
            const status = await row.$('td:nth-child(4)')
            const process = await row.$('td:nth-child(15)')
            const powerfull = 'N.A.'
            const serial = await row.$('td:nth-child(6)')

            const text_status = await (await status.getProperty('textContent')).jsonValue()
            const text_process = await (await process.getProperty('textContent')).jsonValue()
            const text_serial = await (await serial.getProperty('textContent')).jsonValue()

            return {
                id: ++index,
                status: STATUS[text_status] || STATUS['DEFAULT'],
                process: text_process,
                powerfull: powerfull,
                serial: text_serial,
            }
        }))

        ListDrivers.push(...list)
    }

    await page.close()

    return { drivers: ListDrivers, criticals: [{ description: 'N.A.' }] }
}

function getFrame(page, name) {
    const frame = page.frames().find(f => f.name() === name);
    if (frame) return frame;
    else return null;
}

export { AccesPage }