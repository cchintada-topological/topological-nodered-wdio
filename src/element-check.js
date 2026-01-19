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

        let browser = await common.getBrowser(context);
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

        if (config.check === 'clickable') {
          node.log += `Check the webelement is clickable, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.$(locator).isClickable()
        } else if (config.check === 'displayed') {
          node.log += `Check the webelement is displayed, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.$(locator).isDisplayed()
        } else if (config.check === 'displayedInView') {
          node.log += `Check the webelement is displayed in view port, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.$(locator).isDisplayedInViewport()
        } else if (config.check === 'enabled') {
          node.log += `Check the webelement is enabled, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.$(locator).isEnabled()
        } else if (config.check === 'existing') {
          node.log += `Check the webelement is existing, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.$(locator).isExisting()
        } else if (config.check === 'focused') {
          node.log += `Check the webelement is focused, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.$(locator).isFocused()
        } else if (config.check === 'selected') {
          node.log += `Check the webelement is selected, identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.$(locator).isSelected()
        }
        await common.log(node)
        common.successStatus(node)
        node.send(msg)
      } catch (e) {
        // if(e.message == 'unable to find'){
        //   msg.payload = false
        //   node.log = `Webelement is NOT displayed, identified using ${locateUsing}: "${locateValue}".`
        //   await common.log(node)
        //   common.successStatus(node)
        //   node.send(msg)
        // }
        // else{
        await common.log(node)
        common.handleError(e, node, msg)
      }
      //}
    })
  }
  RED.nodes.registerType('element-check', elementCheck)
}
