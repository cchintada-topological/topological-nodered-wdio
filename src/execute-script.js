const common = require('./wdio-common')

module.exports = function (RED) {
  function executeScript(config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.on('input', async (msg) => {
      try {
        common.clearStatus(node);
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

        let script = config.script || msg.script

        if (config.action === 'sync') {
          node.log += `Execute synchronous Javascript: "${script}"${element ? ` By passing the webelement identified using ${locateUsing}: "${locateValue}"` : ''}.`
          await browser.executeScript(script, Array.from(element))
        } else if (config.action === 'aSync') {
          node.log += `Execute the asynchronous Javascript: "${script}"${element ? ` By passing the webelement identified using ${locateUsing}: "${locateValue}"` : ''}.`
          await browser.executeAsyncScript(script, Array.from(element))
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
  RED.nodes.registerType('execute-script', executeScript)
}
