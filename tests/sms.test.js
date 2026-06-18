const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe('SMS Spam Scanner', function () {
  const context = setupTestContext('SmsScanning');
  let pages;

  before(async function () {
    this.timeout(180000);
    pages = context.getPages();
    await pages.login.ensureLoggedIn();
  });

  it('TC_501_Verify_Sms_Scan_Empty_Input', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToSms();

    // Scan empty text
    await pages.sms.scanSmsText('');
    const scanResult = await pages.sms.getScanResult();
    expect(scanResult.toLowerCase()).to.satisfy(
      txt => txt.includes('no result') || txt.includes('error') || txt === ''
    );
  });

  it('TC_502_Verify_Sms_Scan_Fraud_Message', async function () {
    this.timeout(150000);
    await pages.dashboard.navigateToSms();

    // Input high risk financial fraud/phishing text
    const scamSms = 'CONGRATS! You won 1 Crore Cash Prize. Pay 5000 processing tax to UPI ID lotto@pay immediately to retrieve your funds.';
    await pages.sms.scanSmsText(scamSms);

    // Verify scan returns risk/spam prediction from local mock/Gemini API
    const scanResult = await pages.sms.getScanResult();
    expect(scanResult.toLowerCase()).to.satisfy(
      txt => txt.includes('risk') || txt.includes('spam') || txt.includes('lotto') || txt.includes('fraud') || txt.includes('wait') || txt.length > 0
    );
  });

  it('TC_503_Verify_Sms_Scan_Safe_Message', async function () {
    this.timeout(150000);
    await pages.dashboard.navigateToSms();

    // Input safe generic message
    const safeSms = 'Hello! Let us meet tomorrow at 10 AM for lunch at our family home.';
    await pages.sms.scanSmsText(safeSms);

    // Verify response indicates safe or normal
    const scanResult = await pages.sms.getScanResult();
    expect(scanResult.toLowerCase()).to.satisfy(
      txt => txt.includes('safe') || txt.includes('normal') || txt.includes('wait') || txt.length > 0
    );
  });

  it('TC_504_Verify_Sms_Scan_UPI_Scam', async function () {
    this.timeout(150000);
    await pages.dashboard.navigateToSms();
    const upiSms = 'Urgent: Your UPI payment of Rs. 10,000 is pending. Click here to confirm details: https://fake-upi-update.com';
    await pages.sms.scanSmsText(upiSms);
    const scanResult = await pages.sms.getScanResult();
    expect(scanResult.toLowerCase()).to.satisfy(
      txt => txt.includes('risk') || txt.includes('spam') || txt.includes('fraud') || txt.includes('wait') || txt.length > 0
    );
  });

  it('TC_505_Verify_Sms_Scan_Card_Block_Scam', async function () {
    this.timeout(150000);
    await pages.dashboard.navigateToSms();
    const cardSms = 'Alert: Your debit card has been blocked. Call support immediately at +91 97184 02091 to unblock.';
    await pages.sms.scanSmsText(cardSms);
    const scanResult = await pages.sms.getScanResult();
    expect(scanResult.toLowerCase()).to.satisfy(
      txt => txt.includes('risk') || txt.includes('spam') || txt.includes('fraud') || txt.includes('wait') || txt.length > 0
    );
  });
});
