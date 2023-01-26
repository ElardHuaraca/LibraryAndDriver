import puppeteer from 'puppeteer'

const accesPage = async () => {

    const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1280,720'] })
    const page = await browser.newPage()
    await page.goto("http://10.0.88.34/login.php")

    const page_load_1 = page.waitForNavigation({ waitUntil: 'networkidle0' })
    const page_load_2 = page.waitForNavigation({ waitUntil: 'networkidle2' })

    /* Authenticate and user selected in list*/
    await page.waitForSelector('#slctAccount_chosen')
    const div = await page.$('#slctAccount_chosen')
    await div.click()

    const li = await page.$('.group-option')
    await li.click()

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

    /* Click on button for view status drivers*/
    await page.waitForSelector('#pgStatusDriveSettings')
    const btn_driver_status = await page.$('#pgStatusDriveSettings')
    await btn_driver_status.click()

    /* wait page load content */
    await new Promise(r => setTimeout(r, 5000))

    await page.waitForSelector('#contentDisplayMainArea')

    await page.waitForSelector('#TBL_DRIVE')
    const table = await page.$('#TBL_DRIVE')
    const content = await table.$$('#drivenum')

    /* Take a screenshot */
    await page.screenshot({ path: "google.png" })
    await browser.close()

}

accesPage()