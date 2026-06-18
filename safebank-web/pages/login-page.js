const { By } = require('selenium-webdriver');
const BasePage = require('./base-page');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Locators
    this.emailInput = By.id('login-email-input');
    this.passwordInput = By.id('login-password-input');
    this.submitBtn = By.id('login-submit-btn');
    this.errorMsg = By.id('login-error-msg');
    this.forgotPasswordLink = By.id('forgot-password-link');
    this.forgotPasswordStatus = By.id('forgot-password-status');
    this.goToRegisterLink = By.id('go-to-register');

    // Registration Locators
    this.regNameInput = By.id('register-name-input');
    this.regEmailInput = By.id('register-email-input');
    this.regPasswordInput = By.id('register-password-input');
    this.regAgreeCheckbox = By.id('register-agree-checkbox');
    this.regSubmitBtn = By.id('register-submit-btn');
    this.regErrorMsg = By.id('register-error-msg');
    this.goToLoginLink = By.id('go-to-login');
  }

  async login(email, password) {
    if (email !== null) await this.writeInput(this.emailInput, email);
    if (password !== null) await this.writeInput(this.passwordInput, password);
    await this.click(this.submitBtn);
  }

  async register(name, email, password, agree = true) {
    if (name !== null) await this.writeInput(this.regNameInput, name);
    if (email !== null) await this.writeInput(this.regEmailInput, email);
    if (password !== null) await this.writeInput(this.regPasswordInput, password);
    
    const checkbox = await this.findElement(this.regAgreeCheckbox);
    const selected = await checkbox.isSelected();
    if (agree !== selected) {
      await checkbox.click();
    }
    await this.click(this.regSubmitBtn);
  }

  async triggerForgotPassword(email) {
    if (email !== null) await this.writeInput(this.emailInput, email);
    await this.click(this.forgotPasswordLink);
  }
}

module.exports = LoginPage;
