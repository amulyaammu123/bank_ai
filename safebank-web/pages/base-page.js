const { By, until } = require('selenium-webdriver');
const logger = require('../utilities/logger');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async visit(url) {
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async findElement(locator, timeout = 10000) {
    try {
      await this.driver.wait(until.elementLocated(locator), timeout);
      const element = await this.driver.findElement(locator);
      await this.driver.wait(until.elementIsVisible(element), timeout);
      return element;
    } catch (err) {
      logger.error(`Element not found or not visible: ${locator.toString()} | Error: ${err.message}`);
      throw err;
    }
  }

  async click(locator, timeout = 10000) {
    const el = await this.findElement(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    logger.info(`Clicking element: ${locator.toString()}`);
    await el.click();
  }

  async writeInput(locator, text, timeout = 10000) {
    const el = await this.findElement(locator, timeout);
    logger.info(`Clearing and typing "${text}" into element: ${locator.toString()}`);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator, timeout = 10000) {
    const el = await this.findElement(locator, timeout);
    const text = await el.getText();
    logger.info(`Retrieved text "${text}" from: ${locator.toString()}`);
    return text;
  }

  async isDisplayed(locator, timeout = 5000) {
    try {
      const el = await this.findElement(locator, timeout);
      return await el.isDisplayed();
    } catch (err) {
      return false;
    }
  }

  async selectOption(locator, value, timeout = 10000) {
    const select = await this.findElement(locator, timeout);
    logger.info(`Selecting dropdown option "${value}" at: ${locator.toString()}`);
    await select.click();
    const option = await this.driver.findElement(By.xpath(`//option[text()='${value}' or @value='${value}']`));
    await option.click();
  }

  async waitForTextToContain(locator, text, timeout = 10000) {
    await this.driver.wait(async () => {
      try {
        const currentText = await this.getText(locator, timeout);
        return currentText.toLowerCase().includes(text.toLowerCase());
      } catch (e) {
        return false;
      }
    }, timeout);
  }
}

module.exports = BasePage;
