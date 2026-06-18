const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class ReportPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get reportNameInput() {
    return 'android=new UiSelector().className("android.widget.EditText").instance(0)';
  }

  get reportTargetInput() {
    return 'android=new UiSelector().className("android.widget.EditText").instance(1)';
  }

  get reportDetailsInput() {
    return 'android=new UiSelector().className("android.widget.EditText").instance(2)';
  }

  get reportSubmitBtn() {
    return '//*[@resource-id="report_submit_btn" or @content-desc="report_submit_btn" or contains(@text, "Submit") or contains(@text, "సమర్పించండి") or contains(@text, "सबमिट") or contains(@text, "புகார்")]';
  }

  // Actions
  async submitReport(reporterName, targetNumber, detailsText) {
    logger.info(`Submitting Fraud Report. Reporter: ${reporterName}, Target: ${targetNumber}`);
    await this.setValue(this.reportNameInput, reporterName);
    await this.setValue(this.reportTargetInput, targetNumber);
    await this.setValue(this.reportDetailsInput, detailsText);
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {}
    await this.click(this.reportSubmitBtn);
  }

  async isReportSubmittedSuccessfully() {
    logger.info('Verifying if report was successfully logged');
    try {
      const confirmationText = '//*[@text[contains(.,"Successfully") or contains(.,"logged") or contains(.,"submitted") or contains(.,"Reported") or contains(.,"Success") or contains(.,"విజయం") or contains(.,"सफलता") or contains(.,"வெற்றி")]]';
      const els = await this.driver.$$(confirmationText);
      if (els.length > 0) {
        return await els[0].isDisplayed();
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}

module.exports = ReportPage;
