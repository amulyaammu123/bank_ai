const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const logger = require('../utilities/logger');

class BasePage {
  constructor(driver, defaultTimeout = 10000) {
    this.driver = driver;
    this.defaultTimeout = defaultTimeout;
  }

  // Parse CSS or XPath selector dynamically
  getLocator(selector) {
    if (selector.startsWith('/') || selector.startsWith('(')) {
      return By.xpath(selector);
    }
    return By.css(selector);
  }

  async visit(url) {
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  // Explicit Wait: Wait for element to be located in the DOM
  async waitForElementLocated(selector, timeout = this.defaultTimeout) {
    const locator = this.getLocator(selector);
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  // Explicit Wait: Wait for element to be visible
  async waitForElementVisible(selector, timeout = this.defaultTimeout) {
    await this.waitForElementLocated(selector, timeout);
    const locator = this.getLocator(selector);
    const element = await this.driver.findElement(locator);
    return await this.driver.wait(until.elementIsVisible(element), timeout);
  }

  // Explicit Wait: Wait for element to be clickable (visible and enabled)
  async waitForElementClickable(selector, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(selector, timeout);
    return await this.driver.wait(until.elementIsEnabled(element), timeout);
  }

  // Find element with explicit wait
  async findElement(selector, timeout = this.defaultTimeout) {
    return await this.waitForElementVisible(selector, timeout);
  }

  // Find multiple elements
  async findElements(selector, timeout = this.defaultTimeout) {
    await this.waitForElementLocated(selector, timeout);
    return await this.driver.findElements(this.getLocator(selector));
  }

  // Dynamic dynamic click with wait and retry
  async click(selector, timeout = this.defaultTimeout) {
    await this.retryAction(async () => {
      const element = await this.waitForElementClickable(selector, timeout);
      await element.click();
    }, 2, 500);
  }

  // Type text with clearing compatible with React state
  async type(selector, text, timeout = this.defaultTimeout) {
    await this.retryAction(async () => {
      const element = await this.waitForElementVisible(selector, timeout);
      // Select all text using control+a and backspace to trigger React input onChange
      const osKey = process.platform === 'darwin' ? '\uE03D' : '\uE009'; // Command or Control
      await element.sendKeys(osKey, 'a');
      await element.sendKeys('\uE003'); // Backspace
      await element.clear();
      if (text !== null && text !== undefined && text !== '') {
        await element.sendKeys(text);
      }
    }, 2, 500);
  }

  // Get text content
  async getText(selector, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(selector, timeout);
    return await element.getText();
  }

  // Get input value attribute
  async getValue(selector, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(selector, timeout);
    return await element.getAttribute('value');
  }

  // Get element attribute
  async getAttribute(selector, attributeName, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(selector, timeout);
    return await element.getAttribute(attributeName);
  }

  // Safe check if element is displayed
  async isDisplayed(selector, timeout = 3000) {
    try {
      await this.waitForElementVisible(selector, timeout);
      return true;
    } catch (err) {
      return false;
    }
  }

  // Checkbox or Radio selection check
  async isSelected(selector, timeout = this.defaultTimeout) {
    const element = await this.waitForElementVisible(selector, timeout);
    return await element.isSelected();
  }

  // Select option from dropdown by visible text
  async selectOptionByText(selector, optionText, timeout = this.defaultTimeout) {
    const dropdown = await this.waitForElementVisible(selector, timeout);
    await dropdown.click();
    
    // Search for option inside dropdown using xpath
    const optionXpath = `//option[text()='${optionText}']`;
    const optionElement = await this.driver.findElement(By.xpath(optionXpath));
    await optionElement.click();
  }

  // Scroll to element using JavaScript
  async scrollToElement(selector) {
    const element = await this.waitForElementLocated(selector);
    await this.driver.executeScript('arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });', element);
  }

  // Custom JS execute script
  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  // Wait for a loader/spinner to disappear
  async waitForLoaderToDisappear(loaderSelector, timeout = this.defaultTimeout) {
    try {
      const locator = this.getLocator(loaderSelector);
      await this.driver.wait(until.elementLocated(locator), 2000);
      const element = await this.driver.findElement(locator);
      await this.driver.wait(until.elementIsNotVisible(element), timeout);
    } catch (e) {
      // Loader didn't show up or disappeared quickly, which is fine
    }
  }

  // Window Handling: Switch to window by index
  async switchToWindow(index) {
    const handles = await this.driver.getAllWindowHandles();
    if (index >= handles.length) {
      throw new Error(`Window index ${index} out of bounds (Total: ${handles.length})`);
    }
    await this.driver.switchTo().window(handles[index]);
  }

  // Alert Handling: Accept
  async acceptAlert() {
    await this.driver.wait(until.alertIsPresent(), this.defaultTimeout);
    const alert = await this.driver.switchTo().alert();
    const text = await alert.getText();
    await alert.accept();
    return text;
  }

  // Alert Handling: Dismiss
  async dismissAlert() {
    await this.driver.wait(until.alertIsPresent(), this.defaultTimeout);
    const alert = await this.driver.switchTo().alert();
    await alert.dismiss();
  }

  // Alert Handling: Get Text
  async getAlertText() {
    await this.driver.wait(until.alertIsPresent(), this.defaultTimeout);
    const alert = await this.driver.switchTo().alert();
    return await alert.getText();
  }

  // Screenshot Capture
  async takeScreenshot(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const screenshotData = await this.driver.takeScreenshot();
    fs.writeFileSync(filePath, screenshotData, 'base64');
    logger.info(`Screenshot captured and saved to: ${filePath}`);
    return filePath;
  }

  // Browser Console Logs Capture (Chrome only)
  async getBrowserConsoleLogs() {
    try {
      const capabilities = await this.driver.getCapabilities();
      const browserName = capabilities.getBrowserName();
      if (browserName === 'chrome' || browserName === 'msedge') {
        const logs = await this.driver.manage().logs().get('browser');
        return logs.map(log => `[${log.level.name}] ${log.message}`).join('\n');
      }
      return 'Console logs only supported on Chromium-based browsers (Chrome/Edge)';
    } catch (e) {
      return `Failed to capture console logs: ${e.message}`;
    }
  }

  // Action Retry Mechanism
  async retryAction(actionFn, retries = 2, delay = 500) {
    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        return await actionFn();
      } catch (err) {
        lastError = err;
        if (i < retries) {
          logger.warn(`Action failed. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}

module.exports = BasePage;
