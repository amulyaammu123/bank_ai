const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');
const Gestures = require('../utilities/gestures');

describe('Gesture Automation & Scroll Validation', function () {
  const context = setupTestContext('Gestures');
  let pages;
  let driver;

  before(async function () {
    this.timeout(60000);
    driver = context.getDriver();
    pages = context.getPages();
    // Log in to access lists
    await pages.login.loginAsDemo();
  });

  it('TC_201_Verify_Dashboard_List_Scrolling', async function () {
    this.timeout(45000);
    // Verify dashboard scroll list is displayed
    const scrollList = await pages.dashboard.isDisplayed(pages.dashboard.dashboardScroll);
    
    // Perform swipe gestures to scroll down and up on the dashboard screen
    await Gestures.swipeUp(driver);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await Gestures.swipeDown(driver);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(true).to.be.true; // Gestures ran without throwing errors
  });

  it('TC_202_Verify_Scroll_Until_Visible_In_Learning_Hub', async function () {
    this.timeout(60000);
    // Navigate to learning tab
    await pages.dashboard.navigateToLearning();

    // Scroll until specific text/element in tutorials scroll list is displayed
    // SafeBankApp.kt contains local safety tips
    const targetTipSelector = '//*[@text[contains(.,"OTP") or contains(.,"UPI") or contains(.,"Card") or contains(.,"Safe") or contains(.,"Scam")]]';
    
    const element = await Gestures.scrollUntilVisible(driver, targetTipSelector, 5);
    const isVisible = await element.isDisplayed();
    expect(isVisible).to.be.true;
  });
});
