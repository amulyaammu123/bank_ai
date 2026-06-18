require('dotenv').config();
const path = require('path');

const config = {
  // Appium server connection details
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    path: process.env.APPIUM_PATH || '/'
  },

  // Connection timeouts in milliseconds
  timeouts: {
    implicit: parseInt(process.env.IMPLICIT_WAIT, 10) || 5000,
    explicit: parseInt(process.env.EXPLICIT_WAIT, 10) || 15000,
    pageLoad: parseInt(process.env.PAGE_LOAD_WAIT, 10) || 30000
  },

  // Base capabilities for Android UiAutomator2 driver
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '13.0',
    'appium:newCommandTimeout': 3600,
    'appium:autoGrantPermissions': true,
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:ignoreHiddenApiPolicyError': true,
    
    // Performance and logging options
    'appium:recordDeviceLogs': true,
    'appium:enableWebviewDetailsCollection': true,
    
    // Choose between running APK or pre-installed app package
    ...(process.env.USE_APK === 'true' || !process.env.APP_PACKAGE ? {
      'appium:app': path.resolve(process.env.APK_PATH || './app/build/outputs/apk/debug/app-debug.apk'),
    } : {
      'appium:appPackage': process.env.APP_PACKAGE || 'com.safebank.ai',
      'appium:appActivity': process.env.APP_ACTIVITY || 'com.safebank.ai.MainActivity',
    })
  }
};

module.exports = config;
