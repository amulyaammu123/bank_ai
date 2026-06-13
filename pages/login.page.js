const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get emailField() {
    return 'android=new UiSelector().className("android.widget.EditText").instance(0)';
  }

  get passwordField() {
    return 'android=new UiSelector().className("android.widget.EditText").instance(1)';
  }

  get loginSubmitBtn() {
    return '//*[@resource-id="login_submit_btn"] | //*[@content-desc="login_submit_btn"] | ~login_submit_btn';
  }

  get guestDemoBtn() {
    return '//*[@resource-id="demo_guest_login_btn"] | //*[@content-desc="demo_guest_login_btn"] | ~demo_guest_login_btn';
  }

  get otpField() {
    return '//*[@resource-id="otp_input_field"] | //*[@content-desc="otp_input_field"] | ~otp_input_field';
  }

  get authErrorMsg() {
    // Locate text starting with or containing error strings below the buttons, or standard text views
    return 'android=new UiSelector().className("android.widget.TextView")'; // will be filtered programmatically
  }

  // Actions
  async login(email, password) {
    logger.info(`Attempting login with email: ${email}`);
    await this.setValue(this.emailField, email);
    await this.setValue(this.passwordField, password);
    await this.click(this.loginSubmitBtn);
  }

  async loginWithOtp(email, otp) {
    logger.info(`Attempting OTP login with email: ${email} and OTP: ${otp}`);
    await this.setValue(this.emailField, email);
    // Click submit to trigger OTP
    await this.click(this.loginSubmitBtn);
    // Wait for OTP field
    await this.setValue(this.otpField, otp);
    // Click submit again to verify OTP
    await this.click(this.loginSubmitBtn);
  }

  async loginAsDemo() {
    logger.info('Logging in as Offline Demo Guest...');
    await this.click(this.guestDemoBtn);
  }

  async toggleSignUpOrLogin() {
    logger.info('Toggling between Sign Up and Login modes');
    // Finds the text button dynamically by searching for SignUp or Login trigger text
    const selector = '//*[@text="Already have an account? Login" or @text="New here? Sign Up"]';
    await this.click(selector);
  }

  async getErrorMessage() {
    // Capture error text displaying dynamically on auth error
    try {
      // Find the TextView that contains error text (usually displayed in red)
      // Check the error message element
      const errorTextSelector = '//*[@text[contains(.,"Invalid") or contains(.,"empty") or contains(.,"Required") or contains(.,"error") or contains(.,"Incorrect")]]';
      if (await this.isDisplayed(errorTextSelector, 3000)) {
        return await this.getText(errorTextSelector);
      }
      return '';
    } catch (err) {
      return '';
    }
  }
}

module.exports = LoginPage;
