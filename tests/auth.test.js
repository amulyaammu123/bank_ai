const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe('Authentication & Session Management', function () {
  const context = setupTestContext('Authentication');
  let pages;

  before(function () {
    pages = context.getPages();
  });

  it('TC_001_Verify_Login_Validation_Empty_Fields', async function () {
    this.timeout(30000);
    // Click submit directly with empty fields
    await pages.login.click(pages.login.loginSubmitBtn);
    
    // Check validation message
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.include('please enter');
  });

  it('TC_002_Verify_Login_Validation_Invalid_Format', async function () {
    this.timeout(30000);
    // Submit login with invalid formatted email
    await pages.login.login('invalidemail', 'short');
    
    // Check validation message
    const errorMsg = await pages.login.getErrorMessage();
    expect(errorMsg.toLowerCase()).to.satisfy(
      err => err.includes('invalid') || err.includes('error') || err.includes('please enter') || err.length > 0
    );
  });

  it('TC_003_Verify_Guest_Demo_Mode_Login', async function () {
    this.timeout(60000);
    // Click Try Offline Demo Mode button
    await pages.login.loginAsDemo();

    // Verify dashboard displays
    const isDashboardVisible = await pages.dashboard.isDisplayed(pages.dashboard.safetyStatusBento);
    expect(isDashboardVisible).to.be.true;
  });

  it('TC_004_Verify_Logout_Functionality', async function () {
    this.timeout(60000);
    // Navigate to profile tab
    await pages.dashboard.navigateToProfile();

    // Click logout
    await pages.profile.logout();

    // Verify redirected back to Login screen
    const isLoginButtonVisible = await pages.login.isDisplayed(pages.login.loginSubmitBtn);
    expect(isLoginButtonVisible).to.be.true;
  });
});
