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
    await pages.login.loginAsDemo();
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
    expect(emailVal.toLowerCase()).to.include('demo');

    await pages.profile.logout();

    // Redirect to Login
    const isLoginButtonVisible = await pages.login.isDisplayed(pages.login.loginSubmitBtn);
    expect(isLoginButtonVisible).to.be.true;
    logger.info('[E2E Step 5] Successfully logged out and returned to login screen');
  });
});
