const DriverFactory = require('../utilities/driverFactory');
const ExcelReporter = require('../utilities/excelReporter');
const Helpers = require('../utilities/helpers');
const logger = require('../utilities/logger');

// Import all Page Objects
const LoginPage = require('../pages/login.page');
const DashboardPage = require('../pages/dashboard.page');
const SmsPage = require('../pages/sms.page');
const CallPage = require('../pages/call.page');
const ReportPage = require('../pages/report.page');
const ProfilePage = require('../pages/profile.page');

/**
   * Initializes page objects and configures Mocha hooks for screenshots,
   * logging, and Excel report compilation.
   * @param {string} moduleName Name of the testing module
   */
function setupTestContext(moduleName) {
  let driver;
  const pages = {};
  let startTime;
  const reporter = ExcelReporter.getInstance();

  before(async function () {
    this.timeout(180000); // Allow 3 minutes for app installation/launch
    logger.info(`Initializing test driver for module: ${moduleName}`);
    driver = await DriverFactory.createDriver();
    
    // Instantiate all POM classes
    pages.login = new LoginPage(driver);
    pages.dashboard = new DashboardPage(driver);
    pages.sms = new SmsPage(driver);
    pages.call = new CallPage(driver);
    pages.report = new ReportPage(driver);
    pages.profile = new ProfilePage(driver);
  });

  beforeEach(function () {
    startTime = new Date();
    logger.info(`>>> RUNNING TEST: ${this.currentTest.title} <<<`);
    reporter.logStep(this.currentTest.title, 'Test Suite Init', 'SUCCESS', `Starting scenario in module: ${moduleName}`);
  });

  afterEach(async function () {
    const status = this.currentTest.state === 'passed' ? 'Passed' : (this.currentTest.state === 'failed' ? 'Failed' : 'Skipped');
    const endTime = new Date();
    
    // Auto-parse Test ID from naming convention e.g., "TC_001_Verify_Login" -> "TC_001"
    const words = this.currentTest.title.split('_');
    const testId = words[0] && words[0].startsWith('TC') ? words[0] : 'TC_GEN';

    reporter.addTestCase(
      testId,
      moduleName,
      this.currentTest.title,
      process.env.DEVICE_NAME || 'Android Emulator',
      status,
      startTime,
      endTime
    );

    if (status === 'Failed') {
      logger.error(`x TEST FAILED: ${this.currentTest.title}`);
      
      // Capture screenshots and logcat dumps on failure
      const screenshotPath = await Helpers.captureScreenshot(driver, this.currentTest.title);
      const logsPath = await Helpers.captureDeviceLogs(driver, this.currentTest.title);
      
      let currentActivity = 'Unknown';
      try {
        currentActivity = await driver.getCurrentActivity();
      } catch (e) {
        logger.warn('Could not retrieve current activity name.');
      }

      reporter.addFailedTest(
        this.currentTest.title,
        this.currentTest.err ? this.currentTest.err.message : 'Assertion failure',
        screenshotPath,
        process.env.DEVICE_NAME || 'Android Emulator',
        process.env.PLATFORM_VERSION || '13.0',
        currentActivity
      );

      reporter.logStep(
        this.currentTest.title,
        'Test Suite Teardown',
        'FAIL',
        `Error: ${this.currentTest.err ? this.currentTest.err.message : 'Unknown'}. Logs: ${logsPath}`
      );
    } else {
      logger.info(`o TEST PASSED: ${this.currentTest.title}`);
      reporter.logStep(this.currentTest.title, 'Test Suite Teardown', 'PASS', 'Scenario completed with no errors.');
    }
  });

  after(async function () {
    logger.info(`Tearing down driver for module: ${moduleName}`);
    await DriverFactory.quitDriver(driver);
  });

  return {
    getDriver: () => driver,
    getPages: () => pages
  };
}

// Global after hook to compile Excel report at the very end of Mocha execution
after(async function () {
  this.timeout(30000);
  logger.info('ALL TEST SUITES COMPLETED. Generating Excel report...');
  const reporter = ExcelReporter.getInstance();
  await reporter.generateReport(
    process.env.DEVICE_NAME || 'Android Emulator',
    process.env.PLATFORM_VERSION || '13.0'
  );
});

module.exports = { setupTestContext };
