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
    logger.info(`=== STARTING SAFEBANK AI E2E SUITE ON ENVIRONMENT: ${config.environment.toUpperCase()} ===`);
    this.startTime = new Date();
  }

  async teardownSuite() {
    const endTime = new Date();
    logger.info(`=== SUITE COMPLETED. WRITING EXCEL REPORT... ===`);
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
    const testStatus = testContext.currentTest.state; 

    let statusString = 'PASSED';
    let remarks = '';

    if (testStatus === 'failed') {
      statusString = 'FAILED';
      const error = testContext.currentTest.err;
      const failureReason = error ? error.message : 'Unknown reason';
      remarks = failureReason;

      logger.error(`Test FAILED: "${testName}" | Reason: ${failureReason}`);

      try {
        // Create screenshots/ directory under safebank-web
        const screenshotDir = path.join(__dirname, '../screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
        const screenshotName = `fail_${sanitizedTestName}_${Date.now()}.png`;
        const screenshotPath = path.join(screenshotDir, screenshotName);

        // Capture Screenshot
        const screenshotData = await this.driver.takeScreenshot();
        fs.writeFileSync(screenshotPath, screenshotData, 'base64');
        logger.info(`Screenshot captured: ${screenshotPath}`);

        // Capture URL
        let currentUrl = 'N/A';
        try {
          currentUrl = await this.driver.getCurrentUrl();
        } catch (e) {}

        // Capture Console Logs
        let consoleLogs = '';
        try {
          const logs = await this.driver.manage().logs().get('browser');
          consoleLogs = logs.map(l => `[${l.level.name}] ${l.message}`).join('\n');
        } catch (e) {}

        // Add to failed list in Excel Generator
        const cleanTestId = testContext.currentTest.title.match(/^\[(TC\d+)\]/) 
          ? testContext.currentTest.title.match(/^\[(TC\d+)\]/)[1] 
          : `TC-${Math.floor(100 + Math.random() * 900)}`;

        const relativeScreenshotPath = path.relative(path.join(__dirname, '..'), screenshotPath);
        excelGenerator.addFailedTest(
          cleanTestId,
          failureReason,
          relativeScreenshotPath,
          config.browser,
          currentUrl
        );

      } catch (err) {
        logger.error(`Failed to execute test failure handler hooks: ${err.message}`);
      }
    } else if (testStatus === 'passed') {
      logger.info(`Test PASSED: "${testName}"`);
    } else {
      statusString = 'SKIPPED';
      logger.warn(`Test SKIPPED: "${testName}"`);
    }

    // Add to test cases sheet in Excel Generator
    const cleanTestId = testContext.currentTest.title.match(/^\[(TC\d+)\]/) 
      ? testContext.currentTest.title.match(/^\[(TC\d+)\]/)[1] 
      : `TC-${Math.floor(100 + Math.random() * 900)}`;

    const moduleName = testContext.currentTest.parent.title || 'Dynamic Module';

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
