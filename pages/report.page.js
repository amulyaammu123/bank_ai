const BasePage = require('./base.page');
const logger = require('../utilities/logger');

class ReportPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Locators
  get reportNameInput() {
    return '//*[@resource-id="report_name_input"] | ~report_name_input';
  }

  get reportTargetInput() {
    return '//*[@resource-id="report_target_input"] | ~report_target_input';
  }

  get reportDetailsInput() {
    return '//*[@resource-id="report_details_input"] | ~report_details_input';
  }

  get reportSubmitBtn() {
    return '//*[@resource-id="report_submit_btn"] | ~report_submit_btn';
  }

  // Actions
  async submitReport(reporterName, targetNumber, detailsText) {
    logger.info(`Submitting Fraud Report. Reporter: ${reporterName}, Target: ${targetNumber}`);
    await this.setValue(this.reportNameInput, reporterName);
    await this.setValue(this.reportTargetInput, targetNumber);
    await this.setValue(this.reportDetailsInput, detailsText);
    await this.click(this.reportSubmitBtn);
  }

  async isReportSubmittedSuccessfully() {
    logger.info('Verifying if report was successfully logged');
    // Compose displays a snackbar, toast, message, or clears the form
    // We will verify the inputs have been cleared or a confirmation popup appears
    try {
      const confirmationText = '//*[@text[contains(.,"Successfully") or contains(.,"logged") or contains(.,"submitted") or contains(.,"Reported")]]';
      return await this.isDisplayed(confirmationText, 4000);
    } catch (err) {
      return false;
    }
  }
}

module.exports = ReportPage;
