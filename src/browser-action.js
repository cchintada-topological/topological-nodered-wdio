const common = require('./wdio-common')

module.exports = function(RED) {
  function browserAction(config) {
    RED.nodes.createNode(this, config)
    const node = this
    common.clearStatus(node)

    node.on('input', async (msg) => {
      try {
        let browser = await common.getBrowser(node.context())

        let url = config.url || msg.url
        let height = config.height || msg.height
        let width = config.width || msg.width
        let keys = config.keysArr || msg.keysArr
        let filePath = config.filePath || msg.filePath

        if (config.action === 'getUrl') {
          node.log = 'Get the url of the web page.'
          msg.payload = await browser.getUrl()
        } else if (config.action === 'navigateTo') {
          node.log = `Navigate to url: "${url}".`
          await browser.navigateTo(url)
        } else if (config.action === 'back') {
          node.log = 'Go to previous page (browser back feature).'
          await browser.back()
        } else if (config.action === 'forward') {
          node.log = 'Go for next page (browser forward feature).'
          await browser.forward()
        } else if (config.action === 'refresh') {
          node.log = 'Refresh the web page.'
          await browser.refresh()
        } else if (config.action === 'getTitle') {
          node.log = 'Get the title of the browser window.'
          msg.payload = await browser.getTitle()
        } else if (config.action === 'setSize') {
          node.log = `Set the Size of browser window to Width: ${width}, Height: ${height}.`
          await browser.setWindowSize(parseInt(width), parseInt(height))
        } else if (config.action === 'maximize') {
          node.log = 'Maximize the browser window.'
          await browser.maximizeWindow()
        } else if (config.action === 'takeScreenShot') {
          node.log = 'Take the screenshot of the browser window.'
          msg.payload = await browser.takeScreenshot()
        } else if (config.action === 'takeFullScreenShot') {
          node.log = 'Take the full screenshot of the browser window.'
          const puppeteerBrowser = await browser.getPuppeteer()
          const pages = await puppeteerBrowser.pages()
          await pages[0].screenshot({ path: filePath, fullPage: true })
          msg.payload = `Full screenshot saved to path: ${filePath}`
        } else if (config.action === 'pageSource') {
          node.log = 'Get the Page source (Source code of the web page).'
          msg.payload = await browser.getPageSource()
        } else if (config.action === 'getMHTML') {
          node.log = 'Get the MHTML (web page archive) of the web page.'
          const puppeteerBrowser = await browser.getPuppeteer()
          const pages = await puppeteerBrowser.pages()
          const client = await pages[0].target().createCDPSession()
          await client.send('Page.enable')
          const {data} = await client.send('Page.captureSnapshot', { format: 'mhtml' })
          msg.payload = data
        } else if (config.action === 'getCookies') {
          node.log = 'Get the cookies stored.'
          msg.payload = await browser.getAllCookies()
        } else if (config.action === 'print') {
          node.log = 'Print the page.'
          await browser.execute('setTimeout(()=> {window.print()}, 2000)')
        } else if (config.action === 'keyStrokes') {
          node.log = `Enter the provide keystrokes: ${key}.`
          let arr = keys.split(',')
          let keyValues = arr.map((item) => item.trim())
          await browser.keys(Array.from(keyValues))
        }
        await common.log(node)
        common.successStatus(node)
        node.send(msg)
      } catch (e) {
        await common.log(node)
        common.handleError(e, node, msg)
      }
    })
  }
  RED.nodes.registerType('browser-action', browserAction)
}
