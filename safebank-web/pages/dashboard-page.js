const { By } = require('selenium-webdriver');
const BasePage = require('./base-page');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.safetyScore = By.id('stat-safety-score');
    this.messagesScanned = By.id('stat-messages-scanned');
    this.threatsBlocked = By.id('stat-threats-blocked');
    this.engineStatus = By.id('stat-engine-status');
    this.filterSelect = By.id('analytics-filter-select');
    this.exportBtn = By.id('export-report-btn');
    this.exportSuccessMsg = By.id('export-success-msg');
    
    // Monthly Report
    this.monthlyReportCard = By.id('monthly-report-card');
    this.loadReportBtn = By.id('load-report-btn');
    this.monthlyReportModal = By.id('monthly-report-modal');
    this.closeReportBtn = By.id('close-report-btn');
  }

  async filterAnalytics(period) {
    await this.selectOption(this.filterSelect, period);
  }

  async openMonthlyReport() {
    await this.click(this.loadReportBtn);
  }

  async closeMonthlyReport() {
    await this.click(this.closeReportBtn);
  }

  async triggerExport() {
    await this.click(this.exportBtn);
  }
}

module.exports = DashboardPage;
