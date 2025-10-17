const common = require('./wdio-common')

module.exports = function(RED) {
  function dropdownAction(config) {
    RED.nodes.createNode(this, config)
    const node = this
    common.clearStatus(node)

    node.on('input', async (msg) => {
      try {
        let locateUsing = config.locateUsing || msg.locateUsing
        let locateValue = config.locateValue || msg.locateValue

        let browser = await common.getBrowser(node.context())
        let locator = await common.getLocator(
          locateUsing,
          locateValue
        )
        let element = await browser.$(locator)

        let text = config.text || msg.text
        let attribute = config.attribute || msg.attribute
        let index = config.index || msg.index
        let value = config.value || msg.value

        if (config.action === 'selectByAttr') {
          node.log = `Select the dropdown value using Attribute: ${attribute} with Value: ${value}.`
          await element.selectByAttribute(attribute, value)
        } else if (config.action === 'selectByIndex') {
          node.log = `Select the dropdown value using Index: ${index}.`
          await element.selectByIndex(parseInt(index))
        } else if (config.action === 'selectByText') {
          node.log = `Select the dropdown value using Visible text: ${text}.`
          await element.selectByVisibleText(text)
        } else if (config.action === 'getValue') {
          node.log = 'Get selected drop down value.'
          msg.payload = await element.getValue()
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
  RED.nodes.registerType('dropdown-action', dropdownAction)
}
