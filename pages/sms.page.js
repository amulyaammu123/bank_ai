const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class SmsPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get smsInputField() {
    return '//*[@resource-id="sms_input_field"] | ~sms_input_field';
  }

  get scanSubmitBtn() {
    return '//*[@resource-id="scan_submit_btn"] | ~scan_submit_btn';
  }

  get resultSection() {
    // Looks for text containing detection parameters like Risk or Score or Fraud
    return '//*[@text[contains(.,"Risk") or contains(.,"Score") or contains(.,"Spam") or contains(.,"Safe")]]';
  }

  // Actions
  async scanSmsText(text) {
    logger.info(`Scanning SMS text: "${text}"`);
    await this.setValue(this.smsInputField, text);
    await this.click(this.scanSubmitBtn);
  }

  async getScanResult() {
    logger.info('Reading SMS scanning AI analysis results');
    try {
      if (await this.isDisplayed(this.resultSection, 6000)) {
        return await this.getText(this.resultSection);
      }
      return 'No result displayed';
    } catch (err) {
      logger.error('Failed to retrieve SMS scan result:', err);
      return 'Error retrieving result';
    }
  }
}

module.exports = SmsPage;
