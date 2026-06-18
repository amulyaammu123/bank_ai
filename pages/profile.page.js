const BasePage = require('./base.page');
const logger = require('../utilities/logger');
const Gestures = require('../utilities/gestures');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get logoutBtn() {
    return '//*[@text="Logout" or @text="LOGOUT" or contains(@text, "Logout") or @text="లాగౌట్" or @text="लॉगआउट" or @text="வெளியேறு"]';
  }

  get voiceAssistSwitch() {
    return '//*[@resource-id="voice_assist_switch" or @content-desc="voice_assist_switch"]';
  }

  get highContrastSwitch() {
    return '//*[@resource-id="high_contrast_switch" or @content-desc="high_contrast_switch"]';
  }

  get emailLabel() {
    return '//*[@text="Email" or @text="ఈమెయిల్" or @text="ईमेल" or @text="மின்னஞ்சல்"]';
  }

  get sosCardBtn() {
    return '//*[@resource-id="profile_sos_card" or @content-desc="profile_sos_card" or contains(@text, "Emergency SOS") or contains(@text, "అత్యవసర") or contains(@text, "आपातकालीन") or contains(@text, "அவசர")]';
  }

  // Actions
  async navigateToSos() {
    logger.info('Navigating to Emergency SOS via profile entry point');
    await this.click(this.sosCardBtn);
  }

  async logout() {
    logger.info('Clicking Logout button in Profile screen');
    try {
      logger.info('Swiping up to make sure Logout button is visible...');
      await Gestures.swipeUp(this.driver);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      logger.warn('Failed to swipe up on Profile screen:', err.message);
    }
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
