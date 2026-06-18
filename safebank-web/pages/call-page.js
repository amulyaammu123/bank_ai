const { By } = require('selenium-webdriver');
const BasePage = require('./base-page');

class CallAnalyzerPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.phoneInput = By.id('phone-input');
    this.phoneScanBtn = By.id('phone-scan-btn');
    this.phoneBlockBtn = By.id('phone-block-btn');
    this.phoneScanResult = By.id('phone-scan-result');
    this.callHistoryTbody = By.id('call-history-tbody');
    this.blockedCallersTbody = By.id('blocked-callers-tbody');
  }

  async scanPhoneNumber(number) {
    if (number !== null) await this.writeInput(this.phoneInput, number);
    await this.click(this.phoneScanBtn);
  }

  async blockPhoneNumber(number) {
    if (number !== null) await this.writeInput(this.phoneInput, number);
    await this.click(this.phoneBlockBtn);
  }

  async getCallHistoryText() {
    const el = await this.findElement(this.callHistoryTbody);
    return await el.getText();
  }

  async getBlockedCallersText() {
    const el = await this.findElement(this.blockedCallersTbody);
    return await el.getText();
  }
}

module.exports = CallAnalyzerPage;
