const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class SmsPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get smsInputField() {
    return '//*[@resource-id="sms_input_field" or @content-desc="sms_input_field" or @class="android.widget.EditText"]';
  }

  get scanSubmitBtn() {
    return '//*[@resource-id="scan_submit_btn" or @content-desc="scan_submit_btn" or @text="Scan Message" or @text="Scan" or contains(@text, "Scan")]';
  }

  get resultSection() {
    return '//*[@resource-id="sms_result_text" or @content-desc="sms_result_text"]';
  }

  // Actions
  async scanSmsText(text) {
    logger.info(`Scanning SMS text: "${text}"`);
    await this.setValue(this.smsInputField, text);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
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
