const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class Helpers {
  /**
   * Captures screen screenshot and saves it to reports/failures/
   */
  static async captureScreenshot(driver, testName) {
    try {
      const screenshotDir = path.resolve(__dirname, '../reports/failures');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const cleanName = testName.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().getTime();
      const filename = `fail_${cleanName}_${timestamp}.png`;
      const fullPath = path.join(screenshotDir, filename);
      
      await driver.saveScreenshot(fullPath);
      logger.info(`Screenshot captured on failure: ${fullPath}`);
      return fullPath;
    } catch (err) {
      logger.error('Failed to capture screenshot:', err);
      return '';
    }
  }

  /**
   * Dumps logcat device logs to a log file
   */
  static async captureDeviceLogs(driver, testName) {
    try {
      const logDir = path.resolve(__dirname, '../reports/failures');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const cleanName = testName.replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = new Date().getTime();
      const filename = `logcat_${cleanName}_${timestamp}.log`;
      const fullPath = path.join(logDir, filename);

      let logcatEntries = [];
      try {
        logcatEntries = await driver.getLogs('logcat');
      } catch (logErr) {
        logger.warn('Could not retrieve logs using getLogs("logcat"). Attempting fallback...');
      }

      const logText = logcatEntries.map(e => `[${new Date(e.timestamp).toISOString()}] [${e.level}] ${e.message}`).join('\n');
      fs.writeFileSync(fullPath, logText || 'Logcat is empty or was unable to be fetched.');
      logger.info(`Device logs captured: ${fullPath}`);
      return fullPath;
    } catch (err) {
      logger.error('Failed to capture device logs:', err);
      return '';
    }
  }

  /**
   * Wait for element to be displayed (explicit wait wrapper)
   */
  static async waitForElement(driver, selector, timeoutMs = 10000) {
    logger.info(`Waiting for element: ${selector} (timeout: ${timeoutMs}ms)`);
    const element = await driver.$(selector);
    await element.waitForDisplayed({ timeout: timeoutMs });
    return element;
  }

  /**
   * Wait for element to be enabled
   */
  static async waitForEnabled(driver, selector, timeoutMs = 10000) {
    logger.info(`Waiting for element to be enabled: ${selector}`);
    const element = await driver.$(selector);
    await element.waitForEnabled({ timeout: timeoutMs });
    return element;
  }

  /**
   * Helper retry mechanism for unstable gestures or async screens
   */
  static async retry(actionFn, retries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await actionFn();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        logger.warn(`Action failed on attempt ${attempt}. Retrying in ${delayMs}ms... Error: ${error.message}`);
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }

  /**
   * Measure action performance (App Launch or Screen Transitions)
   */
  static async measurePerformance(actionName, actionFn) {
    const startTime = new Date();
    logger.info(`[Perf Metric] Starting measurement: ${actionName}`);
    const result = await actionFn();
    const endTime = new Date();
    const duration = endTime - startTime;
    logger.info(`[Perf Metric] Finished ${actionName}: ${duration}ms`);
    return { result, duration };
  }
}

module.exports = Helpers;
