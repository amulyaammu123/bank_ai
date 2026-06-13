const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class CallPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get callNumberInput() {
    return '//*[@resource-id="call_number_input"] | ~call_number_input';
  }

  get detectNumberBtn() {
    return '//*[@resource-id="detect_number_btn"] | ~detect_number_btn';
  }

  get triggerOtpCallBtn() {
    return '//*[@resource-id="trigger_otp_call"] | ~trigger_otp_call';
  }

  get triggerPrizeCallBtn() {
    return '//*[@resource-id="trigger_prize_call"] | ~trigger_prize_call';
  }

  get triggerPoliceCallBtn() {
    return '//*[@resource-id="trigger_police_call"] | ~trigger_police_call';
  }

  get triggerNormalCallBtn() {
    return '//*[@resource-id="trigger_normal_call"] | ~trigger_normal_call';
  }

  get hangupCallBtn() {
    return '//*[@resource-id="hangup_call_btn"] | ~hangup_call_btn';
  }

  get callPredictionText() {
    return '//*[@text[contains(.,"Risk") or contains(.,"Scam") or contains(.,"Prediction") or contains(.,"Vishing") or contains(.,"Normal") or contains(.,"Trust")]]';
  }

  // Actions
  async simulateCustomCall(number) {
    logger.info(`Simulating custom call from number: ${number}`);
    await this.setValue(this.callNumberInput, number);
    await this.click(this.detectNumberBtn);
  }

  async triggerOtpCallPreset() {
    logger.info('Simulating spam call preset: OTP Scam Call');
    await this.click(this.triggerOtpCallBtn);
  }

  async triggerPrizeCallPreset() {
    logger.info('Simulating spam call preset: Lottery Prize Scam Call');
    await this.click(this.triggerPrizeCallBtn);
  }

  async triggerPoliceCallPreset() {
    logger.info('Simulating spam call preset: Fake Police Threats Call');
    await this.click(this.triggerPoliceCallBtn);
  }

  async triggerNormalCallPreset() {
    logger.info('Simulating safe call preset: Normal Friend Call');
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
