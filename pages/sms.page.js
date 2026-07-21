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
    if (text !== undefined && text !== null) {
      await this.setValue(this.smsInputField, text);
    }
    try {
      await this.pressBack();
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {}
    
    try {
      await this.click(this.scanSubmitBtn);
    } catch (err) {
      logger.warn('First click attempt on scanSubmitBtn failed, retrying with fallback...');
      try {
        const btn = await this.driver.$('//*[@text="Scan Message" or @text="Scan" or contains(@text, "Scan") or contains(@text, "SCAN") or @class="android.widget.Button"]');
        await btn.click();
      } catch (e) {
        logger.error('Fallback click failed:', e.message);
      }
    }
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
