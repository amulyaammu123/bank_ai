const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe.skip('Emergency SOS & Contact Management', function () {
  const context = setupTestContext('EmergencySos');
  let pages;

  before(async function () {
    this.timeout(60000);
    pages = context.getPages();
    await pages.login.ensureLoggedIn();
  });

  beforeEach(async function () {
    this.timeout(30000);
    // Go to Profile -> SOS screen
    await pages.dashboard.navigateToProfile();
    await pages.profile.navigateToSos();
    await new Promise(resolve => setTimeout(resolve, 1500));
  });

  it('TC_701_Verify_Sos_Activation_And_Cancellation', async function () {
    this.timeout(45000);

    // Click Giant SOS Button
    await pages.sos.triggerSos();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify SOS warning banner displays
    const isBannerVisible = await pages.dashboard.isDisplayed('//*[@content-desc="SOS Warning actively triggered" or contains(@text, "SOS EMERGENCY ALERTS TRANSMITTED")]');
    expect(isBannerVisible).to.be.true;

    // Click Giant SOS Button again to cancel
    await pages.sos.triggerSos();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify SOS warning banner is hidden
    const isBannerVisibleAfterCancel = await pages.dashboard.isDisplayed('//*[@content-desc="SOS Warning actively triggered" or contains(@text, "SOS EMERGENCY ALERTS TRANSMITTED")]', 2000);
    expect(isBannerVisibleAfterCancel).to.be.false;
  });

  it('TC_702_Verify_Add_Emergency_Contact_Validation', async function () {
    this.timeout(45000);
    
    // Submit with empty name and phone
    await pages.sos.setValue(pages.sos.contactNameField, '');
    await pages.sos.setValue(pages.sos.contactPhoneField, '');
    await pages.sos.clickAddContactSubmit();

    // Verify contact not added (e.g. check "No Contacts" text is still visible if initially empty, or verify contactNameField is not cleared/reset)
    const isNoContactsVisible = await pages.sos.isDisplayed('//*[contains(@text, "No emergency SOS contacts")]', 3000);
    // If there were already contacts, verifying empty submission doesn't add empty row
    const isEmptyContactRowVisible = await pages.sos.isContactPresent(':');
    expect(isEmptyContactRowVisible).to.be.false;
  });

  it('TC_703_Verify_Successful_Add_Emergency_Contact', async function () {
    this.timeout(45000);

    // Fill in valid contact name and phone number
    const contactName = 'Mom Urgent';
    const contactPhone = '+91 91111 22222';
    await pages.sos.addContact(contactName, contactPhone);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify contact name and phone number are displayed in the list
    const isContactAdded = await pages.sos.isContactPresent(contactName);
    expect(isContactAdded).to.be.true;
  });

  it('TC_704_Verify_Delete_Emergency_Contact', async function () {
    this.timeout(45000);

    // Ensure we have a contact first
    const contactName = 'Delete Test';
    const contactPhone = '+91 93333 44444';
    await pages.sos.addContact(contactName, contactPhone);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Delete the contact
    await pages.sos.deleteFirstContact();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify it is no longer displayed
    const isContactPresentAfterDelete = await pages.sos.isContactPresent(contactName);
    expect(isContactPresentAfterDelete).to.be.false;
  });
});
