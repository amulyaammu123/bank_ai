const Helpers = require('../utilities/helpers');
const logger = require('../utilities/logger');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Safe click element with explicit wait
   */
  async click(selector) {
    logger.info(`Clicking element: ${selector}`);
    const el = await Helpers.waitForElement(this.driver, selector);
    await el.click();
  }

  /**
   * Safe input element value with explicit wait
   */
  async setValue(selector, value) {
    logger.info(`Setting value on ${selector}`);
    const el = await Helpers.waitForElement(this.driver, selector);
    try {
      await el.clearValue();
    } catch (err) {}
    
    // Fallback for Android Compose UI where clearValue() is often ignored.
    // If there is any existing text, click and manually delete all characters first.
    try {
      const currentText = await el.getText();
      if (currentText && currentText.length > 0) {
        await el.click();
        // Send backspace keys for the length of current text plus some buffer
        for (let i = 0; i < currentText.length + 10; i++) {
          await this.driver.pressKeyCode(67); // KEYCODE_DEL
        }
      }
    } catch (err) {
      logger.warn('Failed manual clear fallback:', err.message);
    }
    
    await el.setValue(value);
  }

  /**
   * Get element text value
   */
  async getText(selector) {
    const el = await Helpers.waitForElement(this.driver, selector);
    const txt = await el.getText();
    logger.info(`Text of ${selector} is: "${txt}"`);
    return txt;
  }

  /**
   * Verify if element exists and is displayed
   */
  async isDisplayed(selector, timeoutMs = 5000) {
    try {
      const el = await this.driver.$(selector);
      return await el.waitForDisplayed({ timeout: timeoutMs });
    } catch (err) {
      return false;
    }
  }

  /**
   * Navigate back on Android
   */
  async pressBack() {
    logger.info('Pressing Android hardware back button');
    try {
      if (typeof this.driver.pressKeyCode === 'function') {
        await this.driver.pressKeyCode(4);
      } else {
        await this.driver.back();
      }
    } catch (err) {
      logger.warn('Failed to pressKeyCode(4), falling back to driver.back():', err.message);
      await this.driver.back();
    }
  }

  /**
   * Relaunch the application
   */
  async relaunchApp() {
    logger.info('Relaunching application');
    await this.driver.terminateApp(process.env.APP_PACKAGE || 'com.safebank.ai');
    await this.driver.activateApp(process.env.APP_PACKAGE || 'com.safebank.ai');
  }
}

module.exports = BasePage;
