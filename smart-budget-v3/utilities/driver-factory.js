const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const logger = require('./logger');

class DriverFactory {
  static async createDriver(browserName, headless = true) {
    const browser = browserName.toLowerCase();
    logger.info(`Initializing WebDriver for browser: ${browser} | Headless: ${headless}`);

    const builder = new Builder();

    switch (browser) {
      case 'chrome': {
        const options = new chrome.Options();
        
        // Anti-flakiness flags
        options.addArguments(
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-infobars',
          '--window-size=1920,1080'
        );

        if (headless) {
          options.addArguments('--headless=new');
        }

        return await builder
          .forBrowser('chrome')
          .setChromeOptions(options)
          .build();
      }

      case 'firefox': {
        const options = new firefox.Options();
        options.addArguments('--width=1920', '--height=1080');

        if (headless) {
          options.addArguments('-headless');
        }

        return await builder
          .forBrowser('firefox')
          .setFirefoxOptions(options)
          .build();
      }

      case 'edge': {
        const options = new edge.Options();
        options.addArguments(
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--window-size=1920,1080'
        );

        if (headless) {
          options.addArguments('--headless=new');
        }

        return await builder
          .forBrowser('MicrosoftEdge')
          .setEdgeOptions(options)
          .build();
      }

      default:
        throw new Error(`Unsupported browser: ${browserName}`);
    }
  }
}

module.exports = DriverFactory;
