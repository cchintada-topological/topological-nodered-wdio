const common = require('./wdio-common')

module.exports = function (RED) {
  function elementCheck(config) {
    RED.nodes.createNode(this, config)
    const node = this
    const context = node.context();

    node.on('input', async (msg) => {
      try {
        common.clearStatus(node)
        let multiple = config.locateType || msg.locateType;
        let locateValues = config.locateValues || msg.locateValues;
        let locateUsing = config.locateUsing || msg.locateUsing;
        let locateValue = config.locateValue || msg.locateValue;
        let element = null;
        node.log = "";

        let browser = await common.getBrowser(context);

        if (!multiple) {
          let locator = await common.getLocator(
            locateUsing,
            locateValue
          )
          element = await browser.$(locator)
          if (!element) {
            throw new Error(`Element not found using ${locateUsing}: ${locateValue}`);
          }
        }
        else {
          for (let i = 0; i < locateValues.length; i++) {
            const { using, value } = locateValues[i];
            let locator = await common.getLocator(
              locateUsing,
              locateValue
            )
            element = await browser.$(locator)
            if (element) {
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
          if (!element) {
            throw new Error(`Element not found using all selector values`);
          }
        }

        if (config.check === 'clickable') {
          node.log += `Check the webelement is clickable, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.isClickable()
        } else if (config.check === 'displayed') {
          node.log += `Check the webelement is displayed, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.isDisplayed()
        } else if (config.check === 'displayedInView') {
          node.log += `Check the webelement is displayed in view port, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.isDisplayedInViewport()
        } else if (config.check === 'enabled') {
          node.log += `Check the webelement is enabled, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.isEnabled()
        } else if (config.check === 'existing') {
          node.log += `Check the webelement is existing, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.isExisting()
        } else if (config.check === 'focused') {
          node.log += `Check the webelement is focused, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.isFocused()
        } else if (config.check === 'selected') {
          node.log += `Check the webelement is selected, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.isSelected()
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
  RED.nodes.registerType('element-check', elementCheck)
}
