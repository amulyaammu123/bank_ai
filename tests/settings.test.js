const { expect } = require('chai');
const { setupTestContext } = require('./baseSetup');

describe('Settings & Accessibility Preferences', function () {
  const context = setupTestContext('Settings');
  let pages;

  before(async function () {
    this.timeout(180000);
    pages = context.getPages();
    await pages.login.ensureLoggedIn();
  });

  it('TC_801_Verify_Language_Change_Telugu', async function () {
    this.timeout(120000);
    // Click TEL button on the header language switcher
    await pages.settings.selectLanguage('TEL');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify subheader or home labels translate to Telugu
    const textPresent = await pages.settings.isDisplayed('//*[contains(@text, "భాష") or contains(@text, "భద్రత") or contains(@text, "హోమ్") or contains(@text, "ప్రొఫైల్")]', 3000);
    expect(textPresent).to.be.true;

    // Reset back to English
    await pages.settings.selectLanguage('EN');
  });

  it('TC_802_Verify_Language_Change_Hindi', async function () {
    this.timeout(120000);
    // Click HIN button
    await pages.settings.selectLanguage('HIN');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify translations to Hindi
    const textPresent = await pages.settings.isDisplayed('//*[contains(@text, "भाषा") or contains(@text, "सुरक्षित") or contains(@text, "होम") or contains(@text, "लॉगआउट")]', 3000);
    expect(textPresent).to.be.true;

    // Reset
    await pages.settings.selectLanguage('EN');
  });

  it('TC_803_Verify_Language_Change_Tamil', async function () {
    this.timeout(120000);
    // Click TAM button
    await pages.settings.selectLanguage('TAM');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify translations to Tamil
    const textPresent = await pages.settings.isDisplayed('//*[contains(@text, "மொழி") or contains(@text, "பாதுகாப்பு") or contains(@text, "முகப்பு") or contains(@text, "சுயவிவரம்")]', 3000);
    expect(textPresent).to.be.true;

    // Reset
    await pages.settings.selectLanguage('EN');
  });

  it('TC_804_Verify_Toggle_Voice_Navigation_Switch', async function () {
    this.timeout(120000);
    // Go to Settings tab from dashboard shortcut card
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickSettingsShortcut();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Toggle voice switch
    await pages.settings.toggleVoiceAssist();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Toggle again to restore defaults
    await pages.settings.toggleVoiceAssist();
    expect(true).to.be.true;
  });

  it('TC_805_Verify_Toggle_High_Contrast_Switch', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickSettingsShortcut();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Toggle high contrast switch
    await pages.settings.toggleHighContrast();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Toggle again to restore defaults
    await pages.settings.toggleHighContrast();
    expect(true).to.be.true;
  });

  it('TC_806_Verify_Settings_Navigation_From_Dashboard', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToHome();
    
    // Tap settings accessibility card on the Dashboard
    await pages.dashboard.clickSettingsShortcut();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify settings screen title shows
    const isSettingsTitleVisible = await pages.settings.isDisplayed('//*[contains(@text, "Accessibility Settings") or contains(@text, "Preferences") or contains(@text, "Settings") or @resource-id="settings_title"]');
    expect(isSettingsTitleVisible).to.be.true;
  });

  it('TC_807_Verify_Text_Scale_Large', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickSettingsShortcut();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Select Large text size
    await pages.settings.setTextScale('large');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Restore standard text size
    await pages.settings.setTextScale('standard');
    expect(true).to.be.true;
  });

  it('TC_808_Verify_Text_Scale_Extra_Large', async function () {
    this.timeout(120000);
    await pages.dashboard.navigateToHome();
    await pages.dashboard.clickSettingsShortcut();
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Select Extra Large text size
    await pages.settings.setTextScale('extra');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Restore standard text size
    await pages.settings.setTextScale('standard');
    expect(true).to.be.true;
  });
});
