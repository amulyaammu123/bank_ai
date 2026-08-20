const BasePage = require('./base.page');
const logger = require('../utilities/logger');
const Gestures = require('../utilities/gestures');

class CallPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get callNumberInput() {
    return '//*[@resource-id="call_number_input" or @content-desc="call_number_input" or @class="android.widget.EditText"]';
  }

  get detectNumberBtn() {
    return '//*[@resource-id="detect_number_btn" or @content-desc="detect_number_btn" or @text="Detect" or @text="DETECT" or contains(@text, "Detect")]';
  }

  get triggerOtpCallBtn() {
    return '//*[@resource-id="trigger_otp_call" or @content-desc="trigger_otp_call" or contains(@text, "OTP") or contains(@text, "otp") or contains(@text, "బ్యాంకర్") or contains(@text, "बैंकर") or contains(@text, "வங்கி")]';
  }

  get triggerPrizeCallBtn() {
    return '//*[@resource-id="trigger_prize_call" or @content-desc="trigger_prize_call" or contains(@text, "Prize") or contains(@text, "lottery") or contains(@text, "బహుమతి") or contains(@text, "इनाम") or contains(@text, "பரிசு")]';
  }

  get triggerPoliceCallBtn() {
    return '//*[@resource-id="trigger_police_call" or @content-desc="trigger_police_call" or contains(@text, "Police") or contains(@text, "threat") or contains(@text, "పోలీసు") or contains(@text, "धमकी") or contains(@text, "போலீஸ்")]';
  }
  get triggerNormalCallBtn() {
    return '//*[@resource-id="trigger_normal_call" or @content-desc="trigger_normal_call" or contains(@text, "Normal") or contains(@text, "Friend") or contains(@text, "సాధారణ") or contains(@text, "सामान्य") or contains(@text, "சாதாரண")]';
  }

  get hangupCallBtn() {
    return '//*[@resource-id="hangup_call_btn" or @content-desc="hangup_call_btn" or @text="Hang Up" or @text="HANG UP" or contains(@text, "Hang") or contains(@text, "Decline") or contains(@text, "కట్") or contains(@text, "काटें") or contains(@text, "துண்டிக்கவும்")]';
  }

  get callPredictionText() {
    return '//*[@text[contains(.,"Risk") or contains(.,"Scam") or contains(.,"Prediction") or contains(.,"Vishing") or contains(.,"Normal") or contains(.,"Trust") or contains(.,"రిస్క్") or contains(.,"जोखिम") or contains(.,"அபாயம்") or contains(.,"సురಕ್ಷితం") or contains(.,"सुरक्षित")]]';
  }
  // Actions
  async simulateCustomCall(number) {
    logger.info(`Simulating custom call from number: ${number}`);
    await this.setValue(this.callNumberInput, number);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
    await this.click(this.detectNumberBtn);
  }

  async triggerOtpCallPreset() {
    logger.info('Simulating spam call preset: OTP Scam Call');
    await Gestures.scrollUntilVisible(this.driver, this.triggerOtpCallBtn, 3).catch(() => {});
    await this.click(this.triggerOtpCallBtn);
  }

  async triggerPrizeCallPreset() {
    logger.info('Simulating spam call preset: Lottery Prize Scam Call');
    await Gestures.scrollUntilVisible(this.driver, this.triggerPrizeCallBtn, 3).catch(() => {});
    await this.click(this.triggerPrizeCallBtn);
  }

  async triggerPoliceCallPreset() {
    logger.info('Simulating spam call preset: Fake Police Threats Call');
    await Gestures.scrollUntilVisible(this.driver, this.triggerPoliceCallBtn, 3).catch(() => {});
    await this.click(this.triggerPoliceCallBtn);
  }

  async triggerNormalCallPreset() {
    logger.info('Simulating safe call preset: Normal Friend Call');
    await Gestures.scrollUntilVisible(this.driver, this.triggerNormalCallBtn, 3).catch(() => {});
    await this.click(this.triggerNormalCallBtn);
  }

  async hangupActiveCall() {
    logger.info('Hanging up the simulated call activity');
    await this.click(this.hangupCallBtn);
  }

  async getCallPrediction() {
    logger.info('Reading call risk score and vishing analysis prediction');
    try {
      if (await this.isDisplayed(this.callPredictionText, 5000)) {
        return await this.getText(this.callPredictionText);
      }
      return 'No prediction displayed';
    } catch (err) {
      logger.error('Failed to get call prediction text:', err);
      return 'Error retrieving prediction';
    }
  }
}

module.exports = CallPage;
