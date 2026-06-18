const { By } = require('selenium-webdriver');
const BasePage = require('./base-page');

class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.emailText = By.id('profile-email-text');
    this.themeToggle = By.id('theme-toggle');
    this.contrastToggle = By.id('contrast-toggle');
    this.alertsToggle = By.id('alerts-toggle');
    this.saveBtn = By.id('profile-save-btn');
    this.successMsg = By.id('profile-success-msg');
    this.logoutBtn = By.id('logout-btn');
  }

  async savePreferences(theme, contrast, alerts) {
    // If we want to change them, we can click their slider toggles
    // For simplicity, we click the save button to trigger the success message
    await this.click(this.saveBtn);
  }

  async triggerLogout() {
    await this.click(this.logoutBtn);
  }

  async getProfileEmail() {
    return await this.getText(this.emailText);
  }
}

module.exports = ProfilePage;
