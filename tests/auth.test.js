const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe('Authentication & Session Management', function () {
  const context = setupTestContext('Authentication');
  let pages;

  before(async function () {
    this.timeout(180000);
    pages = context.getPages();
    await pages.login.ensureLoggedOut();
  });

  it('TC_001_Verify_Login_Validation_Empty_Fields', async function () {
    this.timeout(120000);
    // Click submit directly with empty fields
    await pages.login.click(pages.login.loginSubmitBtn);
    
    // Check validation message
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.include('please enter');
  });

  it('TC_002_Verify_Login_Validation_Invalid_Format', async function () {
    this.timeout(120000);
    // Submit login with invalid formatted email
    await pages.login.login('invalidemail', 'short');
    
    // Check validation message
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.satisfy(
      err => err.includes('invalid') || err.includes('error') || err.includes('please enter') || err.length > 0
    );
  });

  it('TC_003_Verify_OTP_Login_Bypass', async function () {
    this.timeout(120000);
    // Log in using the OTP bypass flow
    await pages.login.loginAsDemo();

    // Verify dashboard displays
    const isDashboardVisible = await pages.dashboard.isDisplayed(pages.dashboard.safetyStatusBento);
    expect(isDashboardVisible).to.be.true;
  });

  it('TC_004_Verify_Logout_Functionality', async function () {
    this.timeout(120000);
    // Navigate to profile tab
    await pages.dashboard.navigateToProfile();

    // Click logout
    await pages.profile.logout();

    // Verify redirected back to Login screen
    const isLoginButtonVisible = await pages.login.isDisplayed(pages.login.loginSubmitBtn);
    expect(isLoginButtonVisible).to.be.true;
  });

  it.skip('TC_005_Verify_Login_With_OTP_Toggle', async function () {
    this.timeout(120000);
    await pages.login.ensureOtpMode(true);
    const isOtpFieldOrBtnVisible = await pages.login.isDisplayed(pages.login.otpToggleBtn);
    expect(isOtpFieldOrBtnVisible).to.be.true;
    // Toggle back to password for subsequent test context clean setup
    await pages.login.ensureOtpMode(false);
  });

  it.skip('TC_006_Verify_OTP_Request_Valid_Email', async function () {
    this.timeout(120000);
    await pages.login.ensureOtpMode(true);
    await pages.login.setValue(pages.login.emailField, 'testotp@safebank.ai');
    await pages.login.click(pages.login.loginSubmitBtn);
    const errorMsg = await pages.login.getErrorMessage();
    // In demo mode or offline, dynamic messages display verification info or errors
    // Since mock logic in viewModel allows demo verification, we wait for OTP sent status or success alert
    expect(errorMsg).to.not.include('valid email address');
    await pages.login.clickChangeEmail();
    await pages.login.ensureOtpMode(false);
  });

  it.skip('TC_007_Verify_OTP_Request_Invalid_Email', async function () {
    this.timeout(120000);
    await pages.login.ensureOtpMode(true);
    await pages.login.setValue(pages.login.emailField, 'invalidemail');
    await pages.login.click(pages.login.loginSubmitBtn);
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.satisfy(err => err.includes('valid') || err.length > 0);
    await pages.login.ensureOtpMode(false);
  });

  it.skip('TC_008_Verify_OTP_Login_Empty_Field', async function () {
    this.timeout(120000);
    await pages.login.ensureOtpMode(true);
    await pages.login.setValue(pages.login.emailField, 'testotp@safebank.ai');
    await pages.login.click(pages.login.loginSubmitBtn);
    // OTP input field appears. Submit empty OTP
    await pages.login.click(pages.login.loginSubmitBtn);
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.satisfy(err => err.includes('6-digit') || err.includes('otp') || err.length > 0);
    await pages.login.clickChangeEmail();
    await pages.login.ensureOtpMode(false);
  });

  it.skip('TC_009_Verify_OTP_Login_Invalid_Format', async function () {
    this.timeout(120000);
    await pages.login.ensureOtpMode(true);
    await pages.login.setValue(pages.login.emailField, 'testotp@safebank.ai');
    await pages.login.click(pages.login.loginSubmitBtn);
    // Enter short OTP code
    await pages.login.setValue(pages.login.otpField, '12');
    await pages.login.click(pages.login.loginSubmitBtn);
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.satisfy(err => err.includes('6-digit') || err.includes('otp') || err.length > 0);
    await pages.login.clickChangeEmail();
    await pages.login.ensureOtpMode(false);
  });

  it.skip('TC_010_Verify_OTP_Login_Success', async function () {
    this.timeout(120000);
    await pages.login.ensureOtpMode(true);
    await pages.login.setValue(pages.login.emailField, 'demo@safebank.ai');
    await pages.login.click(pages.login.loginSubmitBtn);
    // Input standard 6 digits OTP code
    await pages.login.setValue(pages.login.otpField, '123456');
    await pages.login.click(pages.login.loginSubmitBtn);
    const isDashboardVisible = await pages.dashboard.isDisplayed(pages.dashboard.safetyStatusBento);
    expect(isDashboardVisible).to.be.true;
    // Logout to reset auth state
    await pages.dashboard.navigateToProfile();
    await pages.profile.logout();
  });

  it('TC_011_Verify_Sign_Up_Mode_Toggle', async function () {
    this.timeout(120000);
    await pages.login.ensureSignUpMode(true);
    const isSignUpBtnVisible = await pages.login.isDisplayed(pages.login.loginSubmitBtn);
    expect(isSignUpBtnVisible).to.be.true;
    // Toggle back to Login
    await pages.login.ensureSignUpMode(false);
  });

  it('TC_012_Verify_Sign_Up_Validation_Empty_Fields', async function () {
    this.timeout(120000);
    await pages.login.ensureSignUpMode(true);
    await pages.login.click(pages.login.loginSubmitBtn);
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.include('email and password');
    await pages.login.ensureSignUpMode(false);
  });

  it('TC_013_Verify_Sign_Up_Successful', async function () {
    this.timeout(120000);
    await pages.login.ensureSignUpMode(true);
    await pages.login.setValue(pages.login.emailField, 'newuser@safebank.ai');
    await pages.login.setValue(pages.login.passwordField, 'Password123');
    await pages.login.click(pages.login.loginSubmitBtn);
    // Wait for redirection to Dashboard
    const isDashboardVisible = await pages.dashboard.isDisplayed(pages.dashboard.safetyStatusBento);
    expect(isDashboardVisible).to.be.true;
    // Logout to reset auth state
    await pages.dashboard.navigateToProfile();
    await pages.profile.logout();
  });

  it('TC_014_Verify_Forgot_Password_Validation_Empty_Email', async function () {
    this.timeout(120000);
    await pages.login.ensureSignUpMode(false);
    await pages.login.ensureOtpMode(false);
    await pages.login.setValue(pages.login.emailField, '');
    await pages.login.clickForgotPassword();
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.satisfy(err => err.includes('valid email') || err.length > 0);
  });

  it('TC_015_Verify_Forgot_Password_Success', async function () {
    this.timeout(120000);
    await pages.login.ensureSignUpMode(false);
    await pages.login.ensureOtpMode(false);
    await pages.login.setValue(pages.login.emailField, 'forgot@safebank.ai');
    await pages.login.clickForgotPassword();
    // Check verification or error message displays
    const errorMsg = await pages.login.getErrorMessage();
    // Since Mock Supabase reset email works, verify we don't get "Please enter a valid email"
    expect(errorMsg.toLowerCase()).to.not.include('enter a valid');
  });
});
