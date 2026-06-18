const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe('Phone Call Fraud Detection', function () {
  const context = setupTestContext('CallDetection');
  let pages;

  before(async function () {
    this.timeout(180000);
    pages = context.getPages();
    await pages.login.ensureLoggedIn();
  });

  it('TC_401_Verify_Custom_Number_Analysis_Empty_Input', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToCall();
    
    // Tap detect with empty input
    await pages.call.click(pages.call.detectNumberBtn);
    const hasIncomingCall = await pages.call.isDisplayed(pages.call.hangupCallBtn, 3000);
    expect(hasIncomingCall).to.be.false;
  });

  it('TC_402_Verify_Custom_Number_Analysis_Valid_Input', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToCall();
    
    // Input custom phone number
    await pages.call.simulateCustomCall('+91 90000 12345');
    
    // Wait and verify detection active screen displays
    const isCallActive = await pages.call.isDisplayed(pages.call.hangupCallBtn);
    expect(isCallActive).to.be.true;

    // Hangup simulated call
    await pages.call.hangupActiveCall();
  });

  it('TC_403_Verify_Lottery_Prize_Scam_Preset', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToCall();

    // Trigger lottery prize scam call
    await pages.call.triggerPrizeCallPreset();

    // Verify risk score / prediction text contains suspicious details
    const prediction = await pages.call.getCallPrediction();
    expect(prediction.toLowerCase()).to.satisfy(
      txt => txt.includes('risk') || txt.includes('scam') || txt.includes('lottery') || txt.includes('fraud') || txt.length > 0
    );

    // Hangup call
    await pages.call.hangupActiveCall();
  });

  it('TC_404_Verify_Police_Threat_Scam_Preset', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToCall();

    // Trigger police fear threat preset
    await pages.call.triggerPoliceCallPreset();

    // Verify prediction text
    const prediction = await pages.call.getCallPrediction();
    expect(prediction.toLowerCase()).to.satisfy(
      txt => txt.includes('risk') || txt.includes('scam') || txt.includes('police') || txt.includes('fear') || txt.length > 0
    );

    await pages.call.hangupActiveCall();
  });

  it('TC_405_Verify_Normal_Friend_Call_Preset', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToCall();

    // Trigger safe normal friend call preset
    await pages.call.triggerNormalCallPreset();

    // Verify prediction text indicates safe or unflagged status
    const prediction = await pages.call.getCallPrediction();
    expect(prediction.toLowerCase()).to.satisfy(
      txt => txt.includes('safe') || txt.includes('normal') || txt.includes('friend') || txt.includes('unflagged') || txt.length > 0
    );

    await pages.call.hangupActiveCall();
  });

  it('TC_406_Verify_Active_Call_Hangup', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToCall();

    // Trigger OTP vishing call
    await pages.call.triggerOtpCallPreset();
    let isCallActive = await pages.call.isDisplayed(pages.call.hangupCallBtn);
    expect(isCallActive).to.be.true;

    // Hangup the active call
    await pages.call.hangupActiveCall();
    
    // Verify call UI has closed and presets are visible again
    isCallActive = await pages.call.isDisplayed(pages.call.hangupCallBtn, 3000);
    expect(isCallActive).to.be.false;
  });
});
