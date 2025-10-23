const common = require('./wdio-common')

module.exports = function(RED) {
  function explicitWait(config) {
    RED.nodes.createNode(this, config)
    const node = this
    common.clearStatus(node)

    node.on('input', async (msg) => {
      try {
        let locateUsing = config.locateUsing || msg.locateUsing
        let locateValue = config.locateValue || msg.locateValue

        let browser = await common.getBrowser(node.context())
        let locator = await common.getLocator(
          browser,
          locateUsing,
          locateValue
        )

        let time = parseInt(config.time || msg.time)
        let reverse = config.reverse === 'true' || msg.reverse
        let error = config.error || msg.error

        if (config.action === 'displayed') {
          node.log = `Waiting for the element to be displayed for ${time}, identified using ${locateUsing}: "${locateValue}".`
          await browser.$(locator).waitForDisplayed({timeout: time, reverse: reverse, timeoutMsg: error, interval : 2000})
        } else if (config.action === 'enabled') {
          node.log = `Waiting for the element to be enabled for ${time}, identified using ${locateUsing}: "${locateValue}".`
          await browser.$(locator).waitForEnabled({timeout: time, reverse: reverse, timeoutMsg: error, interval : 2000})
        } else if (config.action === 'exists') {
          node.log = `Waiting for the element to be exists for ${time}, identified using ${locateUsing}: "${locateValue}".`
          await browser.$(locator).waitForExist({timeout: time, reverse: reverse, timeoutMsg: error, interval : 2000})
        } else if (config.action === 'until') {
          await browser.$(locator).waitUntil()
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
  RED.nodes.registerType('explicit-wait', explicitWait)
}