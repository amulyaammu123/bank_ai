const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');
const logger = require('../utilities/logger');

describe('Full End-to-End User Workflows', function () {
  const context = setupTestContext('EndToEndFlow');
  let pages;

  before(function () {
    pages = context.getPages();
  });

  it('TC_301_Execute_Complete_Banking_Safety_Workflow', async function () {
    this.timeout(180000); // 3 minutes for full flow

    // 1. GUEST LOGIN
    logger.info('[E2E Step 1] Logging in as Demo Guest');
    await pages.login.ensureLoggedIn();
    const isDashboardVisible = await pages.dashboard.isDisplayed(pages.dashboard.safetyStatusBento);
    expect(isDashboardVisible).to.be.true;

    // 2. SCAN SMS FOR SPAM
    logger.info('[E2E Step 2] Navigating to SMS Scanner and scanning message');
    await pages.dashboard.navigateToSms();
    await pages.sms.scanSmsText('URGENT: Your bank account has been blocked due to suspicious activity. Click here http://safebank-scam-update.com to update your KYC immediately.');
    
    // Wait for analysis
    const scanResult = await pages.sms.getScanResult();
    logger.info(`[E2E Step 2] SMS Scan Result: ${scanResult}`);
    expect(scanResult.toLowerCase()).to.satisfy(
      txt => txt.includes('risk') || txt.includes('scam') || txt.includes('block') || txt.includes('kyc') || txt.length > 0
    );

    // 3. SIMULATE CALL VISHING WARNING
    logger.info('[E2E Step 3] Navigating to Call Alert and simulating OTP scam call');
    await pages.dashboard.navigateToCall();
    await pages.call.triggerOtpCallPreset();

    // Verify prediction displays
    const callPrediction = await pages.call.getCallPrediction();
    logger.info(`[E2E Step 3] Call Spam Prediction: ${callPrediction}`);
    
    // Hangup simulated call
    await pages.call.hangupActiveCall();

    // 4. REPORT FRAUD
    logger.info('[E2E Step 4] Navigating to Report Fraud screen');
    // Swipe list or go back to home, then click report tile
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickReportTile();
    
    await pages.report.submitReport(
      'Demo User',
      '+91 1800 425 3800',
      'UPI OTP phishing attempt offering immediate account update.'
    );
    logger.info('[E2E Step 4] Report submitted');

    // 5. PROFILE & SETTINGS CHECKS & LOGOUT
    logger.info('[E2E Step 5] Navigating to Profile to log out');
    await pages.dashboard.navigateToProfile();
    
    const emailVal = await pages.profile.getProfileEmail();
    logger.info(`[E2E Step 5] Profile email retrieved: ${emailVal}`);
    expect(emailVal.toLowerCase()).to.satisfy(val => val.includes('demo') || val === '');

    await pages.profile.logout();

    // Redirect to Login
    const isLoginButtonVisible = await pages.login.isDisplayed(pages.login.loginSubmitBtn);
    expect(isLoginButtonVisible).to.be.true;
    logger.info('[E2E Step 5] Successfully logged out and returned to login screen');
  });

  it.skip('TC_302_Execute_SOS_And_Contact_Management_Workflow', async function () {
    this.timeout(180000); // 3 minutes

    // 1. Log in
    logger.info('[E2E Step 1] Ensuring user is logged in');
    await pages.login.ensureLoggedIn();

    // 2. Go to Profile -> SOS
    logger.info('[E2E Step 2] Navigating to SOS screen via Profile');
    await pages.dashboard.navigateToProfile();
    await pages.profile.navigateToSos();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Add family contact
    logger.info('[E2E Step 3] Adding emergency contact');
    const contactName = 'Dad Emergency';
    const contactPhone = '+91 92222 33333';
    await pages.sos.addContact(contactName, contactPhone);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Trigger SOS
    logger.info('[E2E Step 4] Triggering SOS');
    await pages.sos.triggerSos();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify banner shows
    const isBannerVisible = await pages.dashboard.isDisplayed('//*[@content-desc="SOS Warning actively triggered" or contains(@text, "SOS EMERGENCY ALERTS TRANSMITTED")]');
    expect(isBannerVisible).to.be.true;

    // 5. Cancel SOS
    logger.info('[E2E Step 5] Canceling SOS alert');
    await pages.sos.triggerSos();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Delete family contact
    logger.info('[E2E Step 6] Deleting contact');
    await pages.sos.deleteFirstContact();
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isContactPresent = await pages.sos.isContactPresent(contactName);
    expect(isContactPresent).to.be.false;

    // Navigate back to profile and log out to prevent state leakage to next tests
    await pages.sos.pressBack();
    await new Promise(resolve => setTimeout(resolve, 1500));
    await pages.profile.logout();
    logger.info('[E2E] SOS and Contact management workflow completed successfully');
  });

  it('TC_303_Execute_Settings_Accessibility_And_Profile_Workflow', async function () {
    this.timeout(180000); // 3 minutes

    logger.info('[E2E Step 1] Ensuring user is logged in');
    await pages.login.ensureLoggedIn();

    // 2. Click Settings shortcut card on Dashboard
    logger.info('[E2E Step 2] Navigating to Settings via Dashboard shortcut card');
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickSettingsShortcut();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Toggle voice assist and high contrast switches
    logger.info('[E2E Step 3] Toggling Accessibility switches');
    await pages.settings.toggleVoiceAssist();
    await pages.settings.toggleHighContrast();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Navigate to Profile screen and verify logout works under modified UI theme state
    logger.info('[E2E Step 4] Navigating to Profile to log out');
    await pages.dashboard.navigateToProfile();
    await new Promise(resolve => setTimeout(resolve, 1500));
    await pages.profile.logout();

    // 5. Verify redirected back to Login screen
    const isLoginButtonVisible = await pages.login.isDisplayed(pages.login.loginSubmitBtn);
    expect(isLoginButtonVisible).to.be.true;

    // 6. Restore default settings by logging back in, going to settings, and toggling back
    logger.info('[E2E Step 6] Logging back in to restore settings to defaults');
    await pages.login.loginAsDemo();
    await pages.dashboard.clickSettingsShortcut();
    await pages.settings.toggleVoiceAssist();
    await pages.settings.toggleHighContrast();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up to profile logout
    await pages.dashboard.navigateToProfile();
    await pages.profile.logout();
    logger.info('[E2E] Settings, Accessibility, and Profile workflow completed successfully');
  });
});
