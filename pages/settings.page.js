const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class SettingsPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get langEnglish() { return '//*[@text="EN"]'; }
  get langTelugu() { return '//*[@text="TEL"]'; }
  get langHindi() { return '//*[@text="HIN"]'; }
  get langTamil() { return '//*[@text="TAM"]'; }

  get voiceAssistSwitch() {
    return '//*[@resource-id="voice_assist_switch" or @content-desc="voice_assist_switch"]';
  }

  get highContrastSwitch() {
    return '//*[@resource-id="high_contrast_switch" or @content-desc="high_contrast_switch"]';
  }

  get textSizeStandardBtn() {
    return '//*[@text="Normal" or @text="NORMAL" or contains(@text, "Normal") or @text="Standard" or @text="STANDARD" or contains(@text, "Standard") or @text="సాధారణ" or @text="सामान्य" or @text="சாதாரண"]';
  }

  get textSizeLargeBtn() {
    return '//*[@text="Large" or @text="LARGE" or contains(@text, "Large")]';
  }

  get textSizeExtraLargeBtn() {
    return '//*[@text="Extra Large" or @text="EXTRA LARGE" or contains(@text, "Extra Large") or contains(@text, "Extra")]';
  }

  // Actions
  async selectLanguage(langCode) {
    logger.info(`Selecting language: ${langCode}`);
    const selector = `//*[@text="${langCode}"]`;
    await this.click(selector);
  }

  async toggleVoiceAssist() {
    logger.info('Toggling Voice Assistant settings switch');
    await this.click(this.voiceAssistSwitch);
  }

  async toggleHighContrast() {
    logger.info('Toggling High Contrast theme switch');
    await this.click(this.highContrastSwitch);
  }

  async setTextScale(scaleName) {
    logger.info(`Setting text scale to: ${scaleName}`);
    let selector = this.textSizeStandardBtn;
    if (scaleName.toLowerCase() === 'large') {
      selector = this.textSizeLargeBtn;
    } else if (scaleName.toLowerCase() === 'extra') {
      selector = this.textSizeExtraLargeBtn;
    }
    await this.click(selector);
  }
}

module.exports = SettingsPage;
