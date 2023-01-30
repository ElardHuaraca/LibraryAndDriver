import puppeteer from 'puppeteer'

const STATUS = {
    'DRIVE_STATUS OKbuttonDriveBullet OK': 'OK',
    'DEFAULT': 'WARNING',
}

const AccesPage = async (ip) => {

    const ListDrivers = []

    const browser = await puppeteer.launch({ headless: false, args: ["--window-size=1366,720", "--fast-start", "--disable-extensions", "--no-sandbox"] })
    const page = await browser.newPage()
    await page.goto(`http://${ip}/login.php`)

    /* configurations */
    await page.setViewport({ width: 1366, height: 720 })

    const page_load_1 = page.waitForNavigation({ waitUntil: 'networkidle0' })
    const page_load_2 = page.waitForNavigation({ waitUntil: 'networkidle2' })
    const sleep = async (ms = 1000) => await new Promise(r => setTimeout(r, ms))

    /* Authenticate and user selected in list*/
    await page.waitForSelector('#slctAccount_chosen')
    const div = await page.$('#slctAccount_chosen')
    await div.click()

    const username = await page.$$('.group-option')
    for (let index = 0; index < username.length; index++) {
        const user = await (await username[index].getProperty('innerText')).jsonValue()
        if (user === 'ehuaraca') await username[index].click()
    }

    await page.type('#logPwd', 'password2023*')
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
    if (open) await (await open.$('.open-close-button')).click()

    table.$$('#drivenum').then(rows => {
        rows.forEach(async row => {
            const div_log_num = await row.$('#DRIVE_LOG_NUM')
            const div_status = await row.$('#DRIVE_STATUS')
            const div_activity = await row.$('#DRIVE_ACTIVITY')

            const text_num = await (await div_log_num.getProperty('textContent')).jsonValue()
            const text_class = await (await div_status.getProperty('className')).jsonValue()
            const text_activity = await (await div_activity.getProperty('textContent')).jsonValue()

            ListDrivers.push({
                id: text_num,
                status: STATUS[text_class] || STATUS['DEFAULT'],
                process: text_activity
            })
        })
    })

    /* Take a screenshot */
    await page.screenshot({ path: "google.png" })
    await browser.close()

    return ListDrivers
}

export default AccesPage