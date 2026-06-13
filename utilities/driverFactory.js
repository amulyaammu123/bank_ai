const { remote } = require('webdriverio');
const { execSync } = require('child_process');
const config = require('../config/appium.config');
const logger = require('./logger');

class DriverFactory {
  /**
   * Detects connected Android devices/emulators via adb.
   * Returns an array of devices.
   */
  static getConnectedDevices() {
    try {
      const output = execSync('adb devices').toString();
      const lines = output.split('\n');
      const devices = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('*') && line.includes('device')) {
          const parts = line.split(/\s+/);
          if (parts.length > 0 && parts[1] === 'device') {
            devices.push(parts[0]);
          }
        }
      }
      return devices;
    } catch (error) {
      logger.error('Failed to run adb devices command. Is Android SDK installed?', error);
      return [];
    }
  }

  /**
   * Initializes and returns a WebdriverIO remote session.
   * @param {Object} overrides Override capabilities (e.g., for parallel runs)
   */
  static async createDriver(overrides = {}) {
    const devices = this.getConnectedDevices();
    const caps = { ...config.capabilities, ...overrides };

    if (devices.length > 0) {
      // Dynamic device detection: Use the first connected device if no udid is explicitly provided
      if (!caps['appium:udid']) {
        caps['appium:udid'] = devices[0];
        logger.info(`Dynamically targeting connected device: ${devices[0]}`);
      }
    } else {
      logger.warn('No active ADB devices detected. Attempting default configurations...');
    }

    const options = {
      hostname: config.server.host,
      port: config.server.port,
      path: config.server.path,
      capabilities: caps,
      logLevel: 'warn' // keeps console output clean, winston handles test logging
    };

    logger.info(`Starting Appium session on ${options.hostname}:${options.port}...`);
    try {
      const driver = await remote(options);
      logger.info(`Session successfully started. ID: ${driver.sessionId}`);
      
      // Set implicit wait timeout
      await driver.setTimeouts(config.timeouts.implicit);
      return driver;
    } catch (error) {
      logger.error('Failed to create Appium session:', error);
      throw error;
    }
  }

  /**
   * Terminates the driver session
   * @param {Object} driver WebdriverIO remote instance
   */
  static async quitDriver(driver) {
    if (driver) {
      try {
        const sessionId = driver.sessionId;
        await driver.deleteSession();
        logger.info(`Appium session terminated successfully. Session: ${sessionId}`);
      } catch (error) {
        logger.error('Error closing Appium session:', error);
      }
    }
  }
}

module.exports = DriverFactory;
