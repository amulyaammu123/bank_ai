const BasePage = require('./base.page');
const logger = require('../utilities/logger');
const Gestures = require('../utilities/gestures');

class SosPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get sosGiantBtn() {
    return '//*[@resource-id="sos_giant_touch_btn" or @content-desc="sos_giant_touch_btn"]';
  }

  get contactNameField() {
    return 'android=new UiSelector().className("android.widget.EditText").instance(0)';
  }

  get contactPhoneField() {
    return 'android=new UiSelector().className("android.widget.EditText").instance(1)';
  }

  get addContactSubmitBtn() {
    return '//*[@resource-id="add_contact_btn" or @content-desc="add_contact_btn" or contains(@text, "SOS List") or contains(@text, "జాబితాకు") or contains(@text, "सूची")]';
  }

  get deleteContactBtn() {
    return '//*[@content-desc="Delete" or @text="Delete" or contains(@content-desc, "Delete")]';
  }

  // Actions
  async triggerSos() {
    logger.info('Tapping SOS giant button');
    await this.click(this.sosGiantBtn);
  }

  async clickAddContactSubmit() {
    logger.info('Scrolling to and clicking Add Contact submit button');
    await Gestures.scrollUntilVisible(this.driver, this.addContactSubmitBtn, 3).catch(() => {});
    await this.click(this.addContactSubmitBtn);
  }

  async addContact(name, phone) {
    logger.info(`Adding emergency contact: "${name}" / "${phone}"`);
    await Gestures.scrollUntilVisible(this.driver, this.contactNameField, 3).catch(() => {});
    await this.setValue(this.contactNameField, name);
    await Gestures.scrollUntilVisible(this.driver, this.contactPhoneField, 3).catch(() => {});
    await this.setValue(this.contactPhoneField, phone);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
    await this.clickAddContactSubmit();
  }

  async deleteFirstContact() {
    logger.info('Deleting the first contact in list');
    await this.click(this.deleteContactBtn);
  }

  async isContactPresent(contactText) {
    logger.info(`Checking if contact "${contactText}" is visible in list`);
    try {
      const selector = `//*[contains(@text, "${contactText}")]`;
      return await this.isDisplayed(selector, 3000);
    } catch (err) {
      return false;
    }
  }
}

module.exports = SosPage;
