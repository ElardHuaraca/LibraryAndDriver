import puppeteer from 'puppeteer'

const STATUS = {
    'DRIVE_STATUS': 'N.A.',
    'DRIVE_STATUS OKbuttonDriveBullet OK': 'OK',
    'DEFAULT': 'WARNING',
}

const LIBRARIES_VERSION = async (...args) => {
    const [page, user_, password_, page_load_2, page_load_1, sleep, ListDrivers, browser, version] = args

    switch (version) {
        case '6480':
            return await Libary6480(page, user_, password_, page_load_2, page_load_1, sleep, ListDrivers, browser,)
        case '3040':
            return await Libary6480(page, user_, password_, page_load_2, page_load_1, sleep, ListDrivers, browser,)
        case '2024':
            return await Libary2024(page, user_, password_, page_load_2, page_load_1, sleep, ListDrivers, browser,)
    }
}

const AccesPage = async (ip, user_, password_, version_) => {

    const ListDrivers = []

    const browser = await puppeteer.launch({ headless: false, args: ["--window-size=1366,720", "--fast-start", "--disable-extensions", "--no-sandbox", "--disable-features=site-per-process"] })
    const page = await browser.newPage()
    await page.goto(`http://${ip}/login.ssi`)

    /* configurations */
    await page.setViewport({ width: 1366, height: 720 })

    const page_load_1 = page.waitForNavigation({ waitUntil: 'networkidle0' })
    const page_load_2 = page.waitForNavigation({ waitUntil: 'networkidle2' })
    const sleep = async (ms = 1000) => await new Promise(r => setTimeout(r, ms))

    /* Authenticate and user selected in list*/
    return await LIBRARIES_VERSION(page, user_, password_, page_load_2, page_load_1, sleep, ListDrivers, browser, version_)
}

async function Libary6480(page, user_, password_, page_load_2, page_load_1, sleep, ListDrivers, browser) {
    try { await page.waitForSelector('#slctAccount_chosen', { timeout: 5000 }) }
    catch (e) { }

    const div = await page.$('#slctAccount_chosen')
    div == null ? '' : await div.click()

    if (div != null) {
        const username = await page.$$('.group-option')
        for (let index = 0; index < username.length; index++) {
            const user = await (await username[index].getProperty('innerText')).jsonValue()
            if (user === (user_ || process.env.USERNAME_LIB))
                await username[index].click()
        }
    }

    await page.type('#logPwd', password_ || process.env.PASSWORD_LIB)
    await page.click('#BTNLOGIN')

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

    /* Take a screenshot */
    await page.screenshot({ path: "google.png" })
    await browser.close()

    return ListDrivers
}

async function Libary2024(page, user_, password_, page_load_2, page_load_1, sleep, ListDrivers, browser) {

    await page.waitForSelector('#ButtonRegion')

    const div = await page.$('#ButtonRegion')
    div.evaluate(async (el) => { await el.children[1].click() })


    /* wait page load content */
    await page_load_2

    /* find frame and click on button respect */
    const frame = getFrame(page, 'tabs')
    await frame.$eval('#status', element => element.click())

    /* wait page load content */
    await sleep(3000)

    /* click on btn status */
    await frame.$eval('#drive_status', element => element.click())

    /* Click on button for view status drivers*/
    await page.waitForSelector('#drive_status')
    const btn_driver_status = await page.$('#drive_status')
    await btn_driver_status.click()

    /* wait page load content */
    await sleep(6000)

    await page.waitForSelector('#main')
    const table = await page.$('#main')

    table.$$('.dataTable').then(rows => {
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

    /* Take a screenshot */
    await page.screenshot({ path: "google.png" })
    await browser.close()

    return ListDrivers
}

function getFrame(page, name) {
    const frame = page.frames().find(f => f.name() === name);
    if (frame) return frame;
    else return null;
}

export default AccesPage