const BasePage = require('./base-page');
const appMetadata = require('../config/app-metadata.json');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.formConfig = appMetadata.forms.login;
    this.emailInput = this.formConfig.fields.find(f => f.name === 'email').selector;
    this.passwordInput = this.formConfig.fields.find(f => f.name === 'password').selector;
    this.submitBtn = this.formConfig.submitButtonSelector;
    this.generalError = '#login-error-msg';
    this.emailFieldError = '#email-error';
    this.passwordFieldError = '#password-error';
  }

  async login(email, password) {
    if (email !== null) {
      await this.type(this.emailInput, email);
    } else {
      await this.driver.findElement(this.getLocator(this.emailInput)).clear();
    }

    if (password !== null) {
      await this.type(this.passwordInput, password);
    } else {
      await this.driver.findElement(this.getLocator(this.passwordInput)).clear();
    }

    await this.click(this.submitBtn);
  }

  async getEmailFieldError() {
    return await this.getText(this.emailFieldError);
  }

  async getPasswordFieldError() {
    return await this.getText(this.passwordFieldError);
  }

  async getGeneralError() {
    return await this.getText(this.generalError);
  }

  async isEmailFieldErrorVisible() {
    return await this.isDisplayed(this.emailFieldError, 2000);
  }

  async isPasswordFieldErrorVisible() {
    return await this.isDisplayed(this.passwordFieldError, 2000);
  }

  async isGeneralErrorVisible() {
    return await this.isDisplayed(this.generalError, 2000);
  }
}

module.exports = LoginPage;
