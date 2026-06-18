const BasePage = require('./base.page');
const logger = require('../utilities/logger');
const Gestures = require('../utilities/gestures');

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
    return '//*[contains(@resource-id, "login_submit_btn") or @content-desc="login_submit_btn"]';
  }



  get otpField() {
    return '//*[contains(@resource-id, "otp_input_field") or @content-desc="otp_input_field"]';
  }

  get authErrorMsg() {
    // Locate text starting with or containing error strings below the buttons, or standard text views
    return 'android=new UiSelector().className("android.widget.TextView")'; // will be filtered programmatically
  }

  get otpToggleBtn() {
    return '//*[contains(@resource-id, "otp_toggle_btn") or @content-desc="otp_toggle_btn"]';
  }

  get forgotPasswordBtn() {
    return '//*[contains(@resource-id, "forgot_password_btn") or @content-desc="forgot_password_btn"]';
  }

  get changeEmailBtn() {
    return '//*[contains(@resource-id, "change_email_btn") or @content-desc="change_email_btn"]';
  }

  async isPasswordMode() {
    try {
      const els = await this.driver.$$('android=new UiSelector().className("android.widget.EditText")');
      if (els.length > 1) {
        const otpInputVisible = await this.isOtpInputDisplayed();
        return !otpInputVisible;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async isOtpInputDisplayed() {
    try {
      const els = await this.driver.$$('//*[contains(@resource-id, "otp_input_field") or @content-desc="otp_input_field"]');
      if (els.length > 0) {
        return await els[0].isDisplayed();
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async ensureOtpMode(enable) {
    const currentlyOtp = !(await this.isPasswordMode());
    if (enable !== currentlyOtp) {
      logger.info(`Switching OTP mode to: ${enable}`);
      await this.click(this.otpToggleBtn);
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const isOtp = !(await this.isPasswordMode());
        if (enable === isOtp) {
          logger.info(`Successfully switched OTP mode to: ${enable}`);
          return;
        }
      }
      logger.warn(`Failed to verify OTP mode switch to ${enable} after timeout`);
    } else {
      logger.info(`Already in desired OTP mode: ${enable}`);
    }
  }

  async ensureSignUpMode(enable) {
    try {
      await this.driver.setTimeouts(500);
    } catch (e) {}

    let currentlySignUp = false;
    try {
      const toggleEl = await this.driver.$('//*[contains(@resource-id, "signup_toggle_btn") or @content-desc="signup_toggle_btn"]');
      let text = await toggleEl.getText();
      if (!text) {
        try {
          const childTextEl = await toggleEl.$('android.widget.TextView');
          text = await childTextEl.getText();
        } catch (e) {}
      }
      logger.info(`signup_toggle_btn text read: "${text}"`);
      currentlySignUp = text && text.includes('Login');
    } catch (err) {
      logger.warn(`Error reading signup_toggle_btn state: ${err.message}`);
    }

    if (enable !== currentlySignUp) {
      logger.info(`Switching Sign Up mode to: ${enable}`);
      try {
        const toggleEl = await this.driver.$('//*[contains(@resource-id, "signup_toggle_btn") or @content-desc="signup_toggle_btn"]');
        await toggleEl.click();
      } catch (err) {
        logger.warn(`Failed to click signup_toggle_btn: ${err.message}`);
      }

      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const freshToggleEl = await this.driver.$('//*[contains(@resource-id, "signup_toggle_btn") or @content-desc="signup_toggle_btn"]');
          let txt = await freshToggleEl.getText();
          if (!txt) {
            try {
              const childTextEl = await freshToggleEl.$('android.widget.TextView');
              txt = await childTextEl.getText();
            } catch (e) {}
          }
          const isSignUp = txt && txt.includes('Login');
          if (enable === isSignUp) {
            logger.info(`Successfully switched Sign Up mode to: ${enable}`);
            try {
              await this.driver.setTimeouts(10000);
            } catch (e) {}
            return;
          }
        } catch (err) {}
      }
      logger.warn(`Failed to verify Sign Up mode switch to ${enable} after timeout`);
    } else {
      logger.info(`Already in desired Sign Up mode: ${enable}`);
    }

    try {
      await this.driver.setTimeouts(10000);
    } catch (e) {}
  }

  // Actions
  async login(email, password) {
    logger.info(`Attempting login with email: ${email}`);
    await this.setValue(this.emailField, email);
    await this.setValue(this.passwordField, password);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
    await this.click(this.loginSubmitBtn);
  }

  async loginWithOtp(email, otp) {
    logger.info(`Attempting OTP login with email: ${email} and OTP: ${otp}`);
    await this.setValue(this.emailField, email);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
    // Click submit to trigger OTP
    await this.click(this.loginSubmitBtn);
    // Wait for OTP field
    await this.setValue(this.otpField, otp);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
    // Click submit again to verify OTP
    await this.click(this.loginSubmitBtn);
  }

  async toggleOtp() {
    logger.info('Toggling OTP / Password login mode');
    await this.click(this.otpToggleBtn);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async clickForgotPassword() {
    logger.info('Clicking Forgot Password button');
    await this.click(this.forgotPasswordBtn);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async clickChangeEmail() {
    logger.info('Clicking Change Email button');
    await this.click(this.changeEmailBtn);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async loginAsDemo() {
    logger.info('Logging in as Offline Demo Guest via password bypass...');
    try {
      if (await this.driver.isKeyboardShown()) {
        logger.info('Keyboard is shown, hiding it...');
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      logger.warn('Failed to hide keyboard before loginAsDemo:', err.message);
    }
    await this.login('demo@safebank.ai', 'Password123');
  }

  async ensureLoggedIn() {
    logger.info('Ensuring user is logged in...');
    const dashboardIndicators = [
      '//*[contains(@resource-id, "safety_status_bento") or @content-desc="safety_status_bento" or contains(@text, "SAFETY STATUS") or contains(@text, "భద్రత స్థితి") or contains(@text, "सुरक्षा स्थिति") or contains(@text, "பாதுகாப்பு நிலை")]'
    ];
    
    let isDashboardVisible = false;
    for (const indicator of dashboardIndicators) {
      try {
        const el = await this.driver.$(indicator);
        if (await el.isDisplayed()) {
          isDashboardVisible = true;
          break;
        }
      } catch (e) {
        // ignore
      }
    }
    
    if (isDashboardVisible) {
      logger.info('Already logged in and on the dashboard.');
    } else {
      logger.info('Not on dashboard, logging in as demo guest...');
      await this.loginAsDemo();
      let dashboardOpened = false;
      for (let i = 0; i < 15; i++) {
        for (const indicator of dashboardIndicators) {
          try {
            const el = await this.driver.$(indicator);
            if (await el.isDisplayed()) {
              dashboardOpened = true;
              break;
            }
          } catch (e) {
            // ignore
          }
        }
        if (dashboardOpened) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      if (!dashboardOpened) {
        throw new Error('Failed to verify dashboard redirection after loginAsDemo');
      }
    }
  }

  async toggleSignUpOrLogin() {
    logger.info('Toggling between Sign Up and Login modes');
    const selector = '//*[contains(@resource-id, "signup_toggle_btn") or @content-desc="signup_toggle_btn"]';
    await this.click(selector);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async getErrorMessage() {
    // Capture error text displaying dynamically on auth error
    try {
      // Find the TextView that contains error text (usually displayed in red)
      // Check the error message element
      const errorTextSelector = '//*[@text[contains(.,"Invalid") or contains(.,"empty") or contains(.,"Required") or contains(.,"error") or contains(.,"Error") or contains(.,"Incorrect") or contains(.,"Please") or contains(.,"enter") or contains(.,"Failed") or contains(.,"failed") or contains(.,"Sync")]]';
      if (await this.isDisplayed(errorTextSelector, 10000)) {
        return await this.getText(errorTextSelector);
      }
      return '';
    } catch (err) {
      return '';
    }
  }

  async ensureLoggedOut() {
    logger.info('Ensuring user is logged out...');
    const loginButton = '//*[contains(@resource-id, "login_submit_btn") or @content-desc="login_submit_btn" or @text="Login" or @text="LOGIN"]';
    const dashboardIndicators = '//*[contains(@resource-id, "safety_status_bento") or @content-desc="safety_status_bento" or contains(@text, "SAFETY STATUS") or contains(@text, "భద్రత స్థితి") or contains(@text, "सुरक्षा स्थिति") or contains(@text, "பாதுகாப்பு நிலை")]';
    
    let isLoginVisible = false;
    let isDashboardVisible = false;
    
    for (let i = 0; i < 15; i++) {
      try {
        const el = await this.driver.$(loginButton);
        if (await el.isDisplayed()) {
          isLoginVisible = true;
          break;
        }
      } catch (e) {}
      try {
        const el = await this.driver.$(dashboardIndicators);
        if (await el.isDisplayed()) {
          isDashboardVisible = true;
          break;
        }
      } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (isLoginVisible) {
      logger.info('Already logged out and on the login screen. Resetting login screen state...');
      try {
        await this.ensureSignUpMode(false);
      } catch (e) {}
      return;
    }
    
    if (isDashboardVisible) {
      logger.info('User is logged in. Navigating to profile and logging out...');
      try {
        const navProfile = '//*[contains(@resource-id, "nav_item_profile") or contains(@content-desc, "nav_item_profile") or @text="Profile" or contains(@text, "Profile") or @text="ప్రొఫైల్" or @text="प्रोफ़ाइल" or @text="சுயவிவரம்"]';
        const profileTab = await this.driver.$(navProfile);
        await profileTab.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const logoutBtn = '//*[@text="Logout" or @text="LOGOUT" or contains(@text, "Logout") or @text="లాగౌట్" or @text="लॉगआउट" or @text="வெளியேறு"]';
        try {
          logger.info('Swiping up to make sure Logout button is visible...');
          await Gestures.swipeUp(this.driver);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
          // ignore
        }
        const logout = await this.driver.$(logoutBtn);
        await logout.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (err) {
        logger.error('Failed to logout in ensureLoggedOut:', err.message);
      }
    } else {
      logger.warn('Neither Login screen nor Dashboard safety bento loaded within 15 seconds.');
    }
  }
}

module.exports = LoginPage;
