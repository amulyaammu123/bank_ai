const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get logoutBtn() {
    return '//*[@text="Logout" or @text="LOGOUT" or contains(@text, "Logout")]';
  }

  get voiceAssistSwitch() {
    return '//*[@resource-id="voice_assist_switch"] | ~voice_assist_switch';
  }

  get highContrastSwitch() {
    return '//*[@resource-id="high_contrast_switch"] | ~high_contrast_switch';
  }

  get emailLabel() {
    return '//*[@text="Email" or @text="ఈమెయిల్" or @text="ईमेल" or @text="மின்னஞ்சல்"]';
  }

  // Actions
  async logout() {
    logger.info('Clicking Logout button in Profile screen');
    await this.click(this.logoutBtn);
  }

  async toggleVoiceAssistant() {
    logger.info('Toggling Voice Assistant settings switch');
    await this.click(this.voiceAssistSwitch);
  }

  async toggleHighContrast() {
    logger.info('Toggling High Contrast Accessibility switch');
    await this.click(this.highContrastSwitch);
  }

  async getProfileEmail() {
    logger.info('Retrieving logged in user email from profile information');
    try {
      // Find text view that is below or near the Email label
      const emailValueSelector = '//*[@text[contains(.,"@")]]';
      if (await this.isDisplayed(emailValueSelector, 3000)) {
        return await this.getText(emailValueSelector);
      }
      return '';
    } catch (err) {
      logger.error('Failed to get email from profile:', err);
      return '';
    }
  }
}

module.exports = ProfilePage;
