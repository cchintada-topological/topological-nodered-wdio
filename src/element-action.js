const common = require('./wdio-common')

module.exports = function(RED) {
  function elementAction(config) {
    RED.nodes.createNode(this, config)
    const node = this
    const context = node.context()
    common.clearStatus(node)

    var getTypeInputValue = async (msg, type, value) => {
      var r = ''
      switch (type) {
        case 'msg':
          r = RED.util.getMessageProperty(msg, value)
          break
        case 'flow':
          r = context.flow.get(value)
          break
        case 'global':
          r = context.global.get(value)
          break
        case 'str':
          try {
            r = unescape(JSON.parse('"' + value + '"'))
          } catch (e) {
            r = value
          }
          break
        case 'num':
          r = parseFloat(value)
          break
        case 'json':
          if (value !== '') {
            r = JSON.parse(value)
          } else {
            r = undefined
          }
      }
      return r
    }

    node.on('input', async (msg) => {
      try {
        let multiple = config.locateType || msg.locateType
        let locateValues = config.locateValues || msg.locateValues
        let locateUsing = multiple ? locateValues[0].using : config.locateUsing || msg.locateUsing
        let locateValue = multiple ? locateValues[0].value : config.locateValue || msg.locateValue
        
        let browser = await common.getBrowser(context)
        let capabilities = browser.capabilities
        let elementId = await common.getElementId(
          browser,
          locateUsing,
          locateValue
        )

        let attribute = config.attribute || msg.attribute

        if (config.action === 'click') {
          node.log = `Click on the webelement identified using ${locateUsing}: "${locateValue}".`
          await browser.elementClick(elementId)
        } else if (config.action === 'clear') {
          node.log = `Clear the Value of the webelement identified using ${locateUsing}: "${locateValue}".`
          await browser.elementClear(elementId)
        } else if (config.action === 'sendKeys') {
          let value = await getTypeInputValue(
            msg,
            config.object,
            config.sendKeys
          )
          node.log = `Enter the Value: "${value}" to the webelement identified using ${locateUsing}: "${locateValue}".`
          await browser.elementSendKeys(
            elementId,
            capabilities.version ? Array.from(value) : value
          )
        } else if (config.action === 'getValue') {
          node.log = `Get the Value of webelement identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.getElementAttribute(elementId, 'value')
        } else if (config.action === 'getText') {
          node.log = `Get the Text of webelement identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.getElementText(elementId)
        } else if (config.action === 'getAttribute') {
          node.log = `Get the Attribute: "${attribute}" of webelement identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await browser.getElementAttribute(elementId, attribute)
        } else if (config.action === 'takeScreenShot') {
          node.log = 'Take the screenshot of the webelement.'
          msg.payload = await browser.takeElementScreenshot(elementId)
        } else if (config.action === 'hover') {
          let element = await common.getElement(
            browser,
            locateUsing,
            locateValue
          )
          node.log = `Hover on the webelement identified using ${locateUsing}: "${locateValue}".`
          msg.payload = await element.moveTo()
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
  RED.nodes.registerType('element-action', elementAction)
}
