import puppeteer from 'puppeteer'


(async () => {

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto("http://10.0.88.34/login.php")

    /* Authenticate and user selected in list*/
    await page.waitForSelector('#slctAccount_chosen')
    const div = await page.$('#slctAccount_chosen')
    await div.click()

    const li = await page.$('.group-option')
    await li.click()

    await page.type("#logPwd", "password2023*")
    await page.click("#BTNLOGIN")

    /* Wait for the page to load */
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    /* wait page load content */
    await page.waitForSelector('#contentDisplayMainArea')


    /* Take a screenshot */
    await page.screenshot({ path: "google.png" })
    await browser.close()

})()