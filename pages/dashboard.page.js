const BasePage = require('./base.page');
const logger = require('../utilities/logger');
const Gestures = require('../utilities/gestures');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Bottom Navigation Bar Locators
  get bottomNav() { return '//*[@resource-id="bottom_nav" or @content-desc="bottom_nav" or contains(@class, "View")]'; }
  get navHome() { return '//*[@resource-id="nav_item_dashboard" or @content-desc="nav_item_dashboard" or @text="Home" or contains(@text, "Home") or @text="హోమ్" or @text="होम" or @text="முகப்பு"]'; }
  get navSms() { return '//*[@resource-id="nav_item_sms" or @content-desc="nav_item_sms" or @text="Message Scanner" or contains(@text, "Message") or @text="SMS" or contains(@text, "సందేశం") or contains(@text, "ఎస్ఎంఎస్") or contains(@text, "संदेश") or contains(@text, "एसएमएस") or contains(@text, "செய்தி") or contains(@text, "எஸ்எம்எஸ்")]'; }
  get navCall() { return '//*[@resource-id="nav_item_call" or @content-desc="nav_item_call" or @text="Calls" or contains(@text, "Calls") or @text="Call" or contains(@text, "కాల్స్") or contains(@text, "कॉल") or contains(@text, "அழைப்புகள்")]'; }
  get navLearning() { return '//*[@resource-id="nav_item_learning" or @content-desc="nav_item_learning" or @text="Tutorials" or contains(@text, "Tutorials") or @text="Learning" or contains(@text, "টিউটোরিয়াল") or contains(@text, "ट्यूटोरियल") or contains(@text, "பயிற்சிகள்")]'; }
  get navProfile() { return '//*[@resource-id="nav_item_profile" or @content-desc="nav_item_profile" or @text="Profile" or contains(@text, "Profile") or @text="ప్రొఫైల్" or @text="प्रोफ़ाइल" or @text="சுயவிவரம்"]'; }
  get dashboardScroll() { return '//android.widget.ScrollView | //android.widget.ListView | //*[@resource-id="dashboard_scroll"]'; }

  // Dashboard Bento and Grid Button Locators
  get voiceAssistantBento() { return '//*[@resource-id="voice_assistant_bento" or @content-desc="voice_assistant_bento" or contains(@text, "VOICE ASSISTANT") or contains(@text, "Voice") or contains(@text, "వాయిస్") or contains(@text, "वॉयस") or contains(@text, "குரல்")]'; }
  get safetyStatusBento() { return '//*[@resource-id="safety_status_bento" or @content-desc="safety_status_bento" or contains(@text, "SAFETY STATUS") or contains(@text, "భద్రత స్థితి") or contains(@text, "सुरक्षा स्थिति") or contains(@text, "பாதுகாப்பு நிலை")]'; }
  get smsTileBtn() { return '//*[@resource-id="sms_tile_btn" or @content-desc="sms_tile_btn" or contains(@text, "SMS") or contains(@text, "Message") or contains(@text, "Scanner") or contains(@text, "సందేశాల") or contains(@text, "స్కానర్") or contains(@text, "संदेश") or contains(@text, "செய்தி") or contains(@text, "ஸ்கேனர்")]'; }
  get callTileBtn() { return '//*[@resource-id="call_tile_btn" or @content-desc="call_tile_btn" or contains(@text, "Call") or contains(@text, "Calls") or contains(@text, "కాల్స్") or contains(@text, "కాల్") or contains(@text, "कॉल") or contains(@text, "அழைப்பு") or contains(@text, "அழைப்புகள்")]'; }
  get learningTileBtn() { return '//*[@resource-id="learning_tile_btn" or @content-desc="learning_tile_btn" or contains(@text, "Learning") or contains(@text, "Tutorials") or contains(@text, "Tips") or contains(@text, "Learn") or contains(@text, "ట్యుటోరియల్స్") or contains(@text, "నేర్చుకోండి") or contains(@text, "ट्यूटोरियल") or contains(@text, "सीखें") or contains(@text, "பயிற்சிகள்") or contains(@text, "கற்க")]'; }
  get reportTileBtn() { return '//*[@resource-id="report_tile_btn" or @content-desc="report_tile_btn" or @text="Report" or @text="రిపోర్ట్" or @text="रिपोर्ट" or @text="புகார்" or @text="Quick Report" or @text="Quick నివేదిక" or @text="त्वरित रिपोर्ट" or @text="விரைவான புகார்"]'; }
  get chatbotTileBtn() { return '//*[@resource-id="chatbot_tile_btn" or @content-desc="chatbot_tile_btn" or contains(@text, "AI Assistant") or contains(@text, "chatbot") or contains(@text, "చాట్") or contains(@text, "चैट") or contains(@text, "அரட்டை") or contains(@text, "సహాయకుడు") or contains(@text, "सहायक") or contains(@text, "உதவியாளர்")]'; }
  get settingsShortcutBtn() { return '//*[@resource-id="settings_shortcut_card" or @content-desc="settings_shortcut_card" or contains(@text, "Accessibility") or contains(@text, "Preferences") or contains(@text, "Settings")]'; }
  get adminBtn() { return '//*[@resource-id="admin_button" or @content-desc="admin_button" or @text="Admin" or @text="ADMIN" or contains(@text, "Admin")]'; }

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
    await Gestures.scrollUntilVisible(this.driver, this.smsTileBtn, 3).catch(() => {});
    await this.click(this.smsTileBtn);
  }

  async clickCallTile() {
    logger.info('Tapping Call Alert bento tile');
    await Gestures.scrollUntilVisible(this.driver, this.callTileBtn, 3).catch(() => {});
    await this.click(this.callTileBtn);
  }

  async clickLearningTile() {
    logger.info('Tapping Learning Hub bento tile');
    await Gestures.scrollUntilVisible(this.driver, this.learningTileBtn, 3).catch(() => {});
    await this.click(this.learningTileBtn);
  }

  async clickReportTile() {
    logger.info('Tapping Report Fraud bento tile');
    await Gestures.scrollUntilVisible(this.driver, this.reportTileBtn, 3).catch(() => {});
    await this.click(this.reportTileBtn);
  }

  async clickChatbotTile() {
    logger.info('Tapping Chatbot bento tile');
    await Gestures.scrollUntilVisible(this.driver, this.chatbotTileBtn, 3).catch(() => {});
    await this.click(this.chatbotTileBtn);
  }

  async clickSettingsShortcut() {
    logger.info('Tapping Settings/Accessibility shortcut card');
    await Gestures.scrollUntilVisible(this.driver, this.settingsShortcutBtn, 3).catch(() => {});
    await this.click(this.settingsShortcutBtn);
  }

  async clickAdminButton() {
    logger.info('Tapping Admin panel button');
    await Gestures.scrollUntilVisible(this.driver, this.adminBtn, 3).catch(() => {});
    await this.click(this.adminBtn);
  }
}

module.exports = DashboardPage;
