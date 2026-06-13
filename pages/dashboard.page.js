const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Bottom Navigation Bar Locators
  get bottomNav() { return '//*[@resource-id="bottom_nav"] | ~bottom_nav'; }
  get navHome() { return '//*[@resource-id="nav_item_dashboard"] | ~nav_item_dashboard'; }
  get navSms() { return '//*[@resource-id="nav_item_sms"] | ~nav_item_sms'; }
  get navCall() { return '//*[@resource-id="nav_item_call"] | ~nav_item_call'; }
  get navLearning() { return '//*[@resource-id="nav_item_learning"] | ~nav_item_learning'; }
  get navProfile() { return '//*[@resource-id="nav_item_profile"] | ~nav_item_profile'; }

  // Dashboard Bento and Grid Button Locators
  get voiceAssistantBento() { return '//*[@resource-id="voice_assistant_bento"] | ~voice_assistant_bento'; }
  get safetyStatusBento() { return '//*[@resource-id="safety_status_bento"] | ~safety_status_bento'; }
  get smsTileBtn() { return '//*[@resource-id="sms_tile_btn"] | ~sms_tile_btn'; }
  get callTileBtn() { return '//*[@resource-id="call_tile_btn"] | ~call_tile_btn'; }
  get learningTileBtn() { return '//*[@resource-id="learning_tile_btn"] | ~learning_tile_btn'; }
  get reportTileBtn() { return '//*[@resource-id="report_tile_btn"] | ~report_tile_btn'; }
  get chatbotTileBtn() { return '//*[@resource-id="chatbot_tile_btn"] | ~chatbot_tile_btn'; }

  // Actions
  async navigateToHome() {
    logger.info('Navigating to Dashboard Home via bottom nav');
    await this.click(this.navHome);
  }

  async navigateToSms() {
    logger.info('Navigating to SMS Scanner via bottom nav');
    await this.click(this.navSms);
  }

  async navigateToCall() {
    logger.info('Navigating to Call Alert via bottom nav');
    await this.click(this.navCall);
  }

  async navigateToLearning() {
    logger.info('Navigating to Learning Hub via bottom nav');
    await this.click(this.navLearning);
  }

  async navigateToProfile() {
    logger.info('Navigating to Profile via bottom nav');
    await this.click(this.navProfile);
  }

  async clickVoiceAssistant() {
    logger.info('Tapping voice assistant bento card');
    await this.click(this.voiceAssistantBento);
  }

  async clickSmsTile() {
    logger.info('Tapping SMS Scanner bento tile');
    await this.click(this.smsTileBtn);
  }

  async clickCallTile() {
    logger.info('Tapping Call Alert bento tile');
    await this.click(this.callTileBtn);
  }

  async clickLearningTile() {
    logger.info('Tapping Learning Hub bento tile');
    await this.click(this.learningTileBtn);
  }

  async clickReportTile() {
    logger.info('Tapping Report Fraud bento tile');
    await this.click(this.reportTileBtn);
  }

  async clickChatbotTile() {
    logger.info('Tapping Chatbot bento tile');
    await this.click(this.chatbotTileBtn);
  }
}

module.exports = DashboardPage;
