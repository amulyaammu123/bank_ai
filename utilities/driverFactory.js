const { remote } = require('webdriverio');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Dynamically configure Android SDK path from local.properties if present
try {
  const localPropPath = path.resolve(__dirname, '../local.properties');
  if (fs.existsSync(localPropPath)) {
    const content = fs.readFileSync(localPropPath, 'utf-8');
    const match = content.match(/sdk\.dir\s*=\s*(.+)/);
    if (match) {
      let sdkDir = match[1].trim();
      // Unescape path backslashes and colons (e.g. C\:\\Users\\... -> C:\Users\...)
      sdkDir = sdkDir.replace(/\\:/g, ':').replace(/\\\\/g, '\\');
      
      process.env.ANDROID_HOME = sdkDir;
      process.env.ANDROID_SDK_ROOT = sdkDir;
      
      const platformTools = path.join(sdkDir, 'platform-tools');
      if (fs.existsSync(platformTools)) {
        const pathSeparator = process.platform === 'win32' ? ';' : ':';
        if (!process.env.PATH.includes(platformTools)) {
          process.env.PATH = `${platformTools}${pathSeparator}${process.env.PATH}`;
        }
      }
      logger.info(`Dynamically configured ANDROID_HOME and PATH for platform-tools: ${sdkDir}`);
    }
  }
} catch (err) {
  logger.warn('Failed to parse local.properties for SDK path:', err.message);
}

const config = require('../config/appium.config');

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
   * Automatically accepts system permission dialogs if they appear.
   */
  static async acceptPermissionDialogs(driver) {
    logger.info('Checking for runtime permission dialogs...');
    try {
      // Temporarily lower implicit timeout to avoid long waits when elements are not present
      await driver.setTimeouts(500);
    } catch (e) {
      // ignore
    }

    const allowSelectors = [
      '//*[@resource-id="com.android.permissioncontroller:id/permission_allow_button"]',
      '//*[@resource-id="com.android.permissioncontroller:id/permission_allow_foreground_only_button"]',
      '//*[@resource-id="android:id/button1"]',
      '//android.widget.Button[@text="Allow" or @text="ALLOW" or contains(@text, "Allow") or contains(@text, "allow") or contains(@text, "While using")]'
    ];
    
    for (let i = 0; i < 5; i++) {
      let clicked = false;
      for (const selector of allowSelectors) {
        try {
          const el = await driver.$(selector);
          if (await el.isDisplayed()) {
            logger.info(`Found permission dialog button. Clicking: ${selector}`);
            await el.click();
            await new Promise(resolve => setTimeout(resolve, 1500)); // wait for animation/next dialog
            clicked = true;
            break;
          }
        } catch (e) {
          // ignore
        }
      }
      if (!clicked) {
        logger.info('No visible permission dialog buttons found.');
        break;
      }
    }

    try {
      // Restore configuration implicit timeout
      await driver.setTimeouts(config.timeouts.implicit);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Initializes and returns a WebdriverIO remote session with retry logic.
   * @param {Object} overrides Override capabilities (e.g., for parallel runs)
   */
  static async createDriver(overrides = {}, attempts = 3) {
    const devices = this.getConnectedDevices();
    const caps = { ...config.capabilities, ...overrides };

    if (devices.length > 0) {
      // Dynamic device detection: Prefer physical device if connected, otherwise use the first device
      if (!caps['appium:udid']) {
        const physical = devices.find(d => !d.toLowerCase().includes('emulator') && !d.includes('127.0.0.1') && !d.includes('5554'));
        caps['appium:udid'] = physical || devices[0];
        logger.info(`Dynamically targeting connected device: ${caps['appium:udid']}`);
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

    for (let attempt = 1; attempt <= attempts; attempt++) {
      logger.info(`Starting Appium session on ${options.hostname}:${options.port}... (Attempt ${attempt}/${attempts})`);
      try {
        const driver = await remote(options);
        logger.info(`Session successfully started. ID: ${driver.sessionId}`);
        
        // Set implicit wait timeout
        await driver.setTimeouts(config.timeouts.implicit);

        // Set UiAutomator2 idle timeout to 1000ms to bypass Compose CircularProgressIndicator blocking
        // Also set enforceXPath1 to true to prevent "Cannot set AccessibilityNodeInfo's field 'mSealed' to 'true'" XPath errors
        try {
          await driver.updateSettings({
            waitForIdleTimeout: 1000,
            enforceXPath1: true
          });
        } catch (err) {
          logger.warn('Failed to set driver settings:', err.message);
        }
        
        // Grant permissions if any dialogs popped up
        await this.acceptPermissionDialogs(driver);
        
        return driver;
      } catch (error) {
        logger.error(`Failed to create Appium session on attempt ${attempt}:`, error.message);
        if (attempt === attempts) {
          throw error;
        }
        logger.info('Waiting 5 seconds before retrying Appium session creation...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
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
        // Stabilize device
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        logger.error('Error closing Appium session:', error);
      }
    }
  }
}

module.exports = DriverFactory;
