const config = require('../config/config');
const DriverFactory = require('../utilities/driver-factory');
const excelGenerator = require('../utilities/excel-generator');
const logger = require('../utilities/logger');
const path = require('path');
const fs = require('fs');

class BaseTest {
  constructor() {
    this.driver = null;
    this.startTime = null;
    this.testStartTime = null;
  }

  async setupSuite() {
    logger.info(`=== STARTING TEST SUITE ON ENVIRONMENT: ${config.environment.toUpperCase()} ===`);
    this.startTime = new Date();
  }

  async teardownSuite() {
    const endTime = new Date();
    logger.info(`=== TEST SUITE COMPLETED. GENERATING EXCEL REPORT... ===`);
    await excelGenerator.generateReport(config.environment, this.startTime, endTime);
  }

  async setupTest(testContext) {
    const testName = testContext.currentTest.fullTitle();
    logger.info(`>>> Starting Test: "${testName}"`);
    this.testStartTime = new Date();

    // Start WebDriver
    this.driver = await DriverFactory.createDriver(config.browser, config.headless);
    return this.driver;
  }

  async teardownTest(testContext) {
    const testName = testContext.currentTest.fullTitle();
    const testDuration = new Date() - this.testStartTime;
    const testStatus = testContext.currentTest.state; // 'passed' | 'failed' | undefined (for pending/skipped)

    let statusString = 'PASSED';
    let remarks = '';

    if (testStatus === 'failed') {
      statusString = 'FAILED';
      const error = testContext.currentTest.err;
      const failureReason = error ? error.message : 'Unknown reason';
      remarks = failureReason;

      logger.error(`Test FAILED: "${testName}" | Reason: ${failureReason}`);

      try {
        // Create reports/failures/ folder if not exists
        const failDir = path.join(__dirname, '../reports/failures');
        if (!fs.existsSync(failDir)) {
          fs.mkdirSync(failDir, { recursive: true });
        }

        const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
        const screenshotName = `fail_${sanitizedTestName}_${Date.now()}.png`;
        const screenshotPath = path.join(failDir, screenshotName);

        // Capture Screenshot
        const BasePage = require('../pages/base-page');
        const basePage = new BasePage(this.driver);
        await basePage.takeScreenshot(screenshotPath);

        // Capture URL
        const currentUrl = await basePage.getCurrentUrl();

        // Capture Console Logs
        const consoleLogs = await basePage.getBrowserConsoleLogs();
        const logsFileName = `console_${sanitizedTestName}_${Date.now()}.txt`;
        const logsFilePath = path.join(failDir, logsFileName);
        fs.writeFileSync(logsFilePath, `URL: ${currentUrl}\nFailure Reason: ${failureReason}\nStack:\n${error ? error.stack : ''}\n\nConsole Logs:\n${consoleLogs}`);

        // Add to failed test list in Excel generator
        const relativeScreenshotPath = path.relative(path.join(__dirname, '..'), screenshotPath);
        excelGenerator.addFailedTest(
          testName,
          failureReason,
          relativeScreenshotPath,
          config.browser,
          currentUrl
        );

        // Log to Winston
        logger.logStep(testName, 'Test Failed Hook Run', 'FAILED', `Saved screenshot to ${relativeScreenshotPath}`);

      } catch (err) {
        logger.error(`Failed to execute test failure handler hooks: ${err.message}`);
      }
    } else if (testStatus === 'passed') {
      logger.info(`Test PASSED: "${testName}"`);
      logger.logStep(testName, 'Test Execution Finished', 'PASSED', 'Completed successfully');
    } else {
      statusString = 'SKIPPED';
      logger.warn(`Test SKIPPED or PENDING: "${testName}"`);
    }

    // Add to test cases sheet in Excel Generator
    const cleanTestId = testContext.currentTest.title.match(/^\[(T\d+)\]/) 
      ? testContext.currentTest.title.match(/^\[(T\d+)\]/)[1] 
      : `T-${Math.floor(100 + Math.random() * 900)}`;

    const moduleName = testContext.currentTest.parent.title || 'Dynamic Suite';

    excelGenerator.addTestCase(
      cleanTestId,
      moduleName,
      testContext.currentTest.title,
      config.browser,
      statusString,
      this.testStartTime,
      new Date(),
      testDuration
    );

    // Quit WebDriver
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }
}

module.exports = BaseTest;
