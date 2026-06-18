const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe('Admin Panel & Logs Audits', function () {
  const context = setupTestContext('AdminPanel');
  let pages;

  before(async function () {
    this.timeout(180000);
    pages = context.getPages();
    await pages.login.ensureLoggedIn();
  });

  it('TC_901_Verify_Admin_Panel_Navigation_And_Data_Display', async function () {
    this.timeout(45000);
    await pages.dashboard.navigateToHome();
    
    // Tap admin button on the bottom of the home dashboard
    await pages.dashboard.clickAdminButton();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Confirm that admin panel is displayed
    const isTitleVisible = await pages.admin.isAdminTitleDisplayed();
    expect(isTitleVisible).to.be.true;
  });
});
