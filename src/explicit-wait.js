const common = require('./wdio-common')

module.exports = function (RED) {
  function explicitWait(config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.on('input', async (msg) => {
      try {
        common.clearStatus(node);
        let multiple = config.locateType || msg.locateType;
        let locateValues = config.locateValues || msg.locateValues;
        let locateUsing = config.locateUsing || msg.locateUsing;
        let locateValue = config.locateValue || msg.locateValue;

        let browser = await common.getBrowser(node.context())
        let elementId = null;
        node.log = "";

        if (!multiple) {
          elementId = await common.getElementId(
            browser,
            locateUsing,
            locateValue
          );
          if (!elementId) {
            throw new Error(`Element not found using ${locateUsing}: ${locateValue}`);
          }
        } else {
          for (let i = 0; i < locateValues.length; i++) {
            const { using, value } = locateValues[i];
            elementId = await common.getElementId(browser, using, value);
            if (elementId) {
              node.log += `Attempt ${i + 1}: Element found using ${using}: ${value}\n`;
              locateUsing = using
              locateValue = value
              break;
            }
            else {
              node.log += `Attempt ${i + 1}: Element not found using ${using}: ${value}\n`;
              node.warn(`Element not found using ${using}: ${value}`);
            }
          }
          if (!elementId) {
            throw new Error(`Element not found using all selector values`);
          }
        }

        let time = parseInt(config.time || msg.time)
        let reverse = config.reverse === 'true' || msg.reverse
        let error = config.error || msg.error

        if (config.action === 'displayed') {
          node.log += `Waiting for the element to be displayed for ${time}, identified using ${locateUsing}: "${locateValue}".`
          await browser.$(locator).waitForDisplayed({ timeout: time, reverse: reverse, timeoutMsg: error, interval: 2000 })
        } else if (config.action === 'enabled') {
          node.log += `Waiting for the element to be enabled for ${time}, identified using ${locateUsing}: "${locateValue}".`
          await browser.$(locator).waitForEnabled({ timeout: time, reverse: reverse, timeoutMsg: error, interval: 2000 })
        } else if (config.action === 'exists') {
          node.log += `Waiting for the element to be exists for ${time}, identified using ${locateUsing}: "${locateValue}".`
          await browser.$(locator).waitForExist({ timeout: time, reverse: reverse, timeoutMsg: error, interval: 2000 })
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
