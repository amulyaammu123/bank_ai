const BasePage = require('./base-page');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.welcomeMsg = '#welcome-message';
    this.logoutBtn = '#logout-btn';
    
    // Navigation Links
    this.navDashboardLink = '#nav-dashboard-link';
    this.navIncomeLink = '#nav-income-link';
    this.navExpenseLink = '#nav-expense-link';
    this.navBudgetLink = '#nav-budget-link';
    this.navReportsLink = '#nav-reports-link';
    this.navProfileLink = '#nav-profile-link';
    
    // Total counters
    this.totalIncomeText = '#dashboard-total-income';
    this.totalExpenseText = '#dashboard-total-expense';
    this.balanceText = '#dashboard-balance';

    // Widgets
    this.modalOpenBtn = '#open-modal-btn';
    this.modalContainer = '#modal-container';
    this.modalCloseBtn = '#close-modal-btn';
    this.modalContent = '#modal-content-text';
    this.runScanBtn = '#run-scan-btn';
    
    this.toastNotification = '#toast-notification';
    this.toastMessage = '#toast-msg-text';
    this.toastClose = '#toast-close-btn';
    
    this.tooltipTrigger = '#tooltip-trigger-btn';
    this.tooltipContainer = '#tooltip-container';
  }

  async getWelcomeMessage() {
    return await this.getText(this.welcomeMsg);
  }

  async logout() {
    await this.click(this.logoutBtn);
  }

  async navigateToDashboard() {
    await this.click(this.navDashboardLink);
  }

  async navigateToIncome() {
    await this.click(this.navIncomeLink);
  }

  async navigateToExpense() {
    await this.click(this.navExpenseLink);
  }

  async navigateToBudget() {
    await this.click(this.navBudgetLink);
  }

  async navigateToReports() {
    await this.click(this.navReportsLink);
  }

  async navigateToProfile() {
    await this.click(this.navProfileLink);
  }

  async getTotalIncome() {
    return await this.getText(this.totalIncomeText);
  }

  async getTotalExpense() {
    return await this.getText(this.totalExpenseText);
  }

  async getBalance() {
    return await this.getText(this.balanceText);
  }

  async openModal() {
    await this.click(this.modalOpenBtn);
  }

  async getModalText() {
    return await this.getText(this.modalContent);
  }

  async closeModal() {
    await this.click(this.modalCloseBtn);
  }

  async runVulnerabilityScan() {
    await this.click(this.runScanBtn);
  }

  async isModalVisible() {
    return await this.isDisplayed(this.modalContainer, 2000);
  }

  async isToastVisible() {
    return await this.isDisplayed(this.toastNotification, 2000);
  }

  async getToastText() {
    return await this.getText(this.toastMessage);
  }

  async closeToast() {
    await this.click(this.toastClose);
  }

  async hoverTooltip() {
    const trigger = await this.findElement(this.tooltipTrigger);
    const actions = this.driver.actions({ bridge: true });
    await actions.move({ origin: trigger }).perform();
  }

  async getTooltipText() {
    return await this.getText(this.tooltipContainer);
  }
}

module.exports = DashboardPage;
