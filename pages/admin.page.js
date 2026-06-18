const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class AdminPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get adminTitleText() {
    return '//*[@text="adminTitle" or @text="Admin Panel & Activity Audits" or contains(@text, "Admin Panel") or contains(@text, "Admin Controls") or contains(@text, "అడ్మిన్")]';
  }

  // Actions
  async isAdminTitleDisplayed() {
    logger.info('Verifying if Admin panel title is displayed');
    return await this.isDisplayed(this.adminTitleText, 5000);
  }
}

module.exports = AdminPage;
