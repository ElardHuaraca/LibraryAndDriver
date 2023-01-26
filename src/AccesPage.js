import puppeteer from 'puppeteer'

const AccesPage = async (ip) => {

    const browser = await puppeteer.launch({ headless: true, args: ["--window-size=1366,720", "--fast-start", "--disable-extensions", "--no-sandbox"] })
    const page = await browser.newPage()
    await page.goto("http://10.0.88.34/login.php")

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

    await page.type("#logPwd", "password2023*")
    await page.click("#BTNLOGIN")

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

    /* Take a screenshot */
    await page.screenshot({ path: "google.png" })
    await browser.close()
}

export default AccesPage