const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class ChatbotPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get chatInputText() {
    return '//*[@resource-id="chat_input_text" or @content-desc="chat_input_text" or @class="android.widget.EditText"]';
  }

  get chatSendBtn() {
    return '//*[@resource-id="chat_send_btn" or @content-desc="chat_send_btn" or contains(@text, "Send") or contains(@text, "మరింత") or contains(@text, "भेजें")]';
  }

  get chatHistoryFlow() {
    return '//*[@resource-id="chat_messages_flow" or @content-desc="chat_messages_flow"]';
  }

  get chatMessages() {
    return 'android=new UiSelector().className("android.widget.TextView")';
  }

  // Actions
  async sendQuery(query) {
    logger.info(`Sending chatbot query: "${query}"`);
    await this.setValue(this.chatInputText, query);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
    await this.click(this.chatSendBtn);
  }

  async getLatestMessageText() {
    logger.info('Retrieving the latest chatbot response message');
    try {
      // Find all TextView elements or text inside the messages flow and grab the last one
      // Or search for typical text content
      const flow = await this.driver.$(this.chatHistoryFlow);
      const textViews = await flow.$$('.//android.widget.TextView');
      if (textViews.length > 0) {
        // Return text of the last text view
        const lastText = await textViews[textViews.length - 1].getText();
        logger.info(`Latest chat message text: "${lastText}"`);
        return lastText;
      }
      return '';
    } catch (err) {
      logger.error('Failed to get latest chat response message:', err);
      return '';
    }
  }
}

module.exports = ChatbotPage;
