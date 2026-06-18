const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const BaseTest = require('./base-test');
const LoginPage = require('../pages/login-page');
const DashboardPage = require('../pages/dashboard-page');
const DynamicFormPage = require('../pages/dynamic-form-page');
const appMetadata = require('../config/app-metadata.json');
const config = require('../config/config');
const excelGenerator = require('../utilities/excel-generator');
const logger = require('../utilities/logger');

describe('Smart Budget v3 E2E Test Suite', function() {
  const baseTest = new BaseTest();
  let driver;

  before(async () => {
    await baseTest.setupSuite();
  });

  after(async () => {
    await baseTest.teardownSuite();
  });

  // Helper function to login
  async function performLogin(driver, email, password) {
    const loginPage = new LoginPage(driver);
    await loginPage.visit(`${config.baseUrl}/login`);
    await loginPage.login(email, password);
  }

  // Helper to locate element with wait
  async function findElementWithWait(locator, timeout = 5000) {
    await driver.wait(until.elementLocated(locator), timeout);
    const element = await driver.findElement(locator);
    await driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  // Helper to wait for table content
  async function getTableTextWithWait(tbodyLocator, expectedText, timeout = 5000) {
    const tbody = await findElementWithWait(tbodyLocator, timeout);
    await driver.wait(async () => {
      const text = await tbody.getText();
      return text.includes(expectedText);
    }, timeout);
    return await tbody.getText();
  }

  // ==========================================
  // 1. ROUTING & LOGIN CONTROLS (9 Tests)
  // ==========================================
  describe('Routing & Authentication Controls', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T101] Should redirect unauthenticated user from protected Route /dashboard', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/dashboard`);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Navigated to /dashboard unauthenticated', 'SUCCESS');
      
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).to.include('/login');
      expect(await loginPage.isGeneralErrorVisible()).to.be.true;
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified redirection to /login with error banner', 'PASSED');
    });

    it('[T102] Should redirect unauthenticated user from protected Route /income', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/income`);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Navigated to /income unauthenticated', 'SUCCESS');
      
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).to.include('/login');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified redirection to /login', 'PASSED');
    });

    it('[T103] Should redirect unauthenticated user from protected Route /expense', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/expense`);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Navigated to /expense unauthenticated', 'SUCCESS');
      
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).to.include('/login');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified redirection to /login', 'PASSED');
    });

    it('[T104] Should redirect unauthenticated user from protected Route /budget', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/budget`);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Navigated to /budget unauthenticated', 'SUCCESS');
      
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).to.include('/login');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified redirection to /login', 'PASSED');
    });

    it('[T105] Should redirect unauthenticated user from protected Route /reports and /profile', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/reports`);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Navigated to /reports unauthenticated', 'SUCCESS');
      expect(await loginPage.getCurrentUrl()).to.include('/login');

      await loginPage.visit(`${config.baseUrl}/profile`);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Navigated to /profile unauthenticated', 'SUCCESS');
      expect(await loginPage.getCurrentUrl()).to.include('/login');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified redirection for /reports and /profile', 'PASSED');
    });

    it('[T106] Should validate empty login input fields', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/login`);
      await loginPage.login('', '');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted empty credentials', 'SUCCESS');

      const emailErr = await loginPage.getEmailFieldError();
      expect(emailErr).to.include('Email is required');
      const passErr = await loginPage.getPasswordFieldError();
      expect(passErr).to.include('Password is required');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted empty fields validation messages', 'PASSED');
    });

    it('[T107] Should validate invalid email pattern format', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/login`);
      await loginPage.login('invalidemail', 'Password123');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted malformed email', 'SUCCESS');

      const emailErr = await loginPage.getEmailFieldError();
      expect(emailErr).to.include('Please enter a valid email address');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted invalid email pattern message', 'PASSED');
    });

    it('[T108] Should show error on incorrect login credentials', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/login`);
      await loginPage.login('wrong@budget.com', 'WrongPass123');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted incorrect credentials', 'SUCCESS');

      expect(await loginPage.isGeneralErrorVisible()).to.be.true;
      const genErr = await loginPage.getGeneralError();
      expect(genErr).to.include('Invalid email or password');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted invalid credentials banner', 'PASSED');
    });

    it('[T109] Should successfully authenticate valid user and redirect to dashboard', async function() {
      const loginPage = new LoginPage(driver);
      await loginPage.visit(`${config.baseUrl}/login`);
      await loginPage.login('user@budget.com', 'Password123');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted valid credentials', 'SUCCESS');

      const dashboard = new DashboardPage(driver);
      expect(await dashboard.getCurrentUrl()).to.include('/dashboard');
      expect(await dashboard.getWelcomeMessage()).to.include('user@budget.com');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted successful login welcome message', 'PASSED');
    });
  });

  // ==========================================
  // 2. REGISTRATION MODULE (5 Tests)
  // ==========================================
  describe('Dynamic Registration Form Controls', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T201] Should dynamically validate all required fields on registration form', async function() {
      const regMeta = appMetadata.forms.registration;
      const form = new DynamicFormPage(driver, 'Registration', regMeta);
      await form.visit(`${config.baseUrl}/register`);
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted empty registration form', 'SUCCESS');

      expect(await form.getFieldError('fullName')).to.include('Full name is required');
      expect(await form.getFieldError('email')).to.include('Email is required');
      expect(await form.getFieldError('password')).to.include('Password is required');
      expect(await form.getFieldError('agreeTerms')).to.include('You must agree to terms');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted validation error messages', 'PASSED');
    });

    it('[T202] Should validate fullName minLength requirements on registration', async function() {
      const regMeta = appMetadata.forms.registration;
      const form = new DynamicFormPage(driver, 'Registration', regMeta);
      await form.visit(`${config.baseUrl}/register`);
      await form.fillField('fullName', 'Jo');
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Filled name shorter than minLength', 'SUCCESS');

      expect(await form.getFieldError('fullName')).to.include('Full name must be at least 3 characters');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted minLength validation', 'PASSED');
    });

    it('[T203] Should validate email format pattern on registration', async function() {
      const regMeta = appMetadata.forms.registration;
      const form = new DynamicFormPage(driver, 'Registration', regMeta);
      await form.visit(`${config.baseUrl}/register`);
      await form.fillField('email', 'not-valid-email');
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Filled invalid email format', 'SUCCESS');

      expect(await form.getFieldError('email')).to.include('Please enter a valid email address');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted email pattern validation', 'PASSED');
    });

    it('[T204] Should validate password complexity/minLength constraints on registration', async function() {
      const regMeta = appMetadata.forms.registration;
      const form = new DynamicFormPage(driver, 'Registration', regMeta);
      await form.visit(`${config.baseUrl}/register`);
      await form.fillField('password', '12345');
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Filled short password', 'SUCCESS');

      expect(await form.getFieldError('password')).to.include('Password must be at least 6 characters');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted password minLength validation', 'PASSED');
    });

    it('[T205] Should successfully register account and redirect to login', async function() {
      const regMeta = appMetadata.forms.registration;
      const form = new DynamicFormPage(driver, 'Registration', regMeta);
      await form.visit(`${config.baseUrl}/register`);
      
      const payload = {
        fullName: 'Jane Doe',
        email: 'jane@budget.com',
        password: 'Password123',
        agreeTerms: true
      };

      await form.fillForm(payload);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Filled registration form with valid criteria data', 'SUCCESS');

      await form.submit();

      // Verify redirection to login page within 2 seconds
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes('/login');
      }, 3000);

      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Successfully registered and redirected to login', 'PASSED');
    });
  });

  // ==========================================
  // 3. WEALTH DASHBOARD MODULE (5 Tests)
  // ==========================================
  describe('Wealth Dashboard Controls', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
      await performLogin(driver, 'user@budget.com', 'Password123');
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T301] Should display correct logged-in user welcome message', async function() {
      const dashboard = new DashboardPage(driver);
      expect(await dashboard.getWelcomeMessage()).to.include('user@budget.com');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified welcome message text', 'PASSED');
    });

    it('[T302] Should display correct calculated Total Income metric', async function() {
      const dashboard = new DashboardPage(driver);
      expect(await dashboard.getTotalIncome()).to.equal('₹62,000');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified total income metric value', 'PASSED');
    });

    it('[T303] Should display correct calculated Total Expenses metric', async function() {
      const dashboard = new DashboardPage(driver);
      expect(await dashboard.getTotalExpense()).to.equal('₹21,700');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified total expense metric value', 'PASSED');
    });

    it('[T304] Should display correct calculated Remaining Balance metric', async function() {
      const dashboard = new DashboardPage(driver);
      expect(await dashboard.getBalance()).to.equal('₹40,300');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified remaining balance metric value', 'PASSED');
    });

    it('[T305] Should open and close the security diagnostics modal overlay', async function() {
      const dashboard = new DashboardPage(driver);
      await dashboard.openModal();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Opened modal dialog', 'SUCCESS');
      expect(await dashboard.isModalVisible()).to.be.true;

      await dashboard.closeModal();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Closed modal dialog', 'SUCCESS');
      expect(await dashboard.isModalVisible()).to.be.false;
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified modal dialog visibility lifecycle', 'PASSED');
    });
  });

  // ==========================================
  // 4. INCOME MANAGER MODULE (5 Tests)
  // ==========================================
  describe('Income Manager Controls', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
      await performLogin(driver, 'user@budget.com', 'Password123');
      const dashboard = new DashboardPage(driver);
      await dashboard.navigateToIncome();
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T401] Should display correct seeded income ledger records in table', async function() {
      const text = await getTableTextWithWait(By.id('income-table-body'), 'January Salary');
      expect(text).to.include('January Salary');
      expect(text).to.include('Freelance Design');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Validated initial seeded income list', 'PASSED');
    });

    it('[T402] Should validate empty income source field', async function() {
      const incMeta = appMetadata.forms.income;
      const form = new DynamicFormPage(driver, 'Income', incMeta);
      await form.fillField('amount', 5000);
      await form.fillField('date', '2026-06-18');
      await form.fillField('category', 'Salary');
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted form with empty source', 'SUCCESS');

      expect(await form.getFieldError('source')).to.include('Source is required');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted source field error message', 'PASSED');
    });

    it('[T403] Should validate positive amount constraint', async function() {
      const incMeta = appMetadata.forms.income;
      const form = new DynamicFormPage(driver, 'Income', incMeta);
      await form.fillField('source', 'Bonus');
      await form.fillField('amount', -100);
      await form.fillField('date', '2026-06-18');
      await form.fillField('category', 'Salary');
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted negative amount', 'SUCCESS');

      expect(await form.getFieldError('amount')).to.include('Amount must be greater than zero');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted amount range constraint error', 'PASSED');
    });

    it('[T404] Should successfully add new income source and update list', async function() {
      const incMeta = appMetadata.forms.income;
      const form = new DynamicFormPage(driver, 'Income', incMeta);
      
      const payload = {
        source: 'Consulting Gig',
        amount: 8000,
        date: '2026-06-18',
        category: 'Investments'
      };

      await form.fillForm(payload);
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted valid income record', 'SUCCESS');

      const successBanner = await findElementWithWait(By.id('income-success-banner'));
      expect(await successBanner.getText()).to.include('successfully recorded');

      const text = await getTableTextWithWait(By.id('income-table-body'), 'Consulting Gig');
      expect(text).to.include('Consulting Gig');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified new income in ledger table', 'PASSED');
    });

    it('[T405] Should successfully delete income record from list', async function() {
      // Seeded January Salary has ID 1, delete button ID is delete-income-1
      const deleteBtn = await findElementWithWait(By.id('delete-income-1'));
      await deleteBtn.click();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Clicked delete income button', 'SUCCESS');

      await driver.wait(async () => {
        const tbody = await findElementWithWait(By.id('income-table-body'));
        const text = await tbody.getText();
        return !text.includes('January Salary');
      }, 5000);

      const tbody = await findElementWithWait(By.id('income-table-body'));
      expect(await tbody.getText()).to.not.include('January Salary');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified income record deleted', 'PASSED');
    });
  });

  // ==========================================
  // 5. EXPENSE MANAGER MODULE (5 Tests)
  // ==========================================
  describe('Expense Manager Controls', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
      await performLogin(driver, 'user@budget.com', 'Password123');
      const dashboard = new DashboardPage(driver);
      await dashboard.navigateToExpense();
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T501] Should display correct seeded expense ledger records in table', async function() {
      const text = await getTableTextWithWait(By.id('expense-table-body'), 'House Rent');
      expect(text).to.include('House Rent');
      expect(text).to.include('Organic Groceries');
      expect(text).to.include('Electricity Bill');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Validated initial seeded expense list', 'PASSED');
    });

    it('[T502] Should validate empty expense title field', async function() {
      const expMeta = appMetadata.forms.expense;
      const form = new DynamicFormPage(driver, 'Expense', expMeta);
      await form.fillField('amount', 300);
      await form.fillField('date', '2026-06-18');
      await form.fillField('category', 'Food');
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted form with empty title', 'SUCCESS');

      expect(await form.getFieldError('title')).to.include('Title is required');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted title field error message', 'PASSED');
    });

    it('[T503] Should validate positive amount constraint on expense', async function() {
      const expMeta = appMetadata.forms.expense;
      const form = new DynamicFormPage(driver, 'Expense', expMeta);
      await form.fillField('title', 'Cofee');
      await form.fillField('amount', 0);
      await form.fillField('date', '2026-06-18');
      await form.fillField('category', 'Food');
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted zero amount', 'SUCCESS');

      expect(await form.getFieldError('amount')).to.include('Amount must be greater than zero');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted amount range constraint error', 'PASSED');
    });

    it('[T504] Should successfully add new expense record and update list', async function() {
      const expMeta = appMetadata.forms.expense;
      const form = new DynamicFormPage(driver, 'Expense', expMeta);
      
      const payload = {
        title: 'Movie Tickets',
        amount: 800,
        date: '2026-06-18',
        category: 'Entertainment'
      };

      await form.fillForm(payload);
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted valid expense record', 'SUCCESS');

      const successBanner = await findElementWithWait(By.id('expense-success-banner'));
      expect(await successBanner.getText()).to.include('successfully logged');

      const text = await getTableTextWithWait(By.id('expense-table-body'), 'Movie Tickets');
      expect(text).to.include('Movie Tickets');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified new expense in ledger table', 'PASSED');
    });

    it('[T505] Should successfully delete expense record from list', async function() {
      // Seeded House Rent has ID 1, delete button ID is delete-expense-1
      const deleteBtn = await findElementWithWait(By.id('delete-expense-1'));
      await deleteBtn.click();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Clicked delete expense button', 'SUCCESS');

      await driver.wait(async () => {
        const tbody = await findElementWithWait(By.id('expense-table-body'));
        const text = await tbody.getText();
        return !text.includes('House Rent');
      }, 5000);

      const tbody = await findElementWithWait(By.id('expense-table-body'));
      expect(await tbody.getText()).to.not.include('House Rent');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified expense record deleted', 'PASSED');
    });
  });

  // ==========================================
  // 6. BUDGET ALLOCATOR MODULE (5 Tests)
  // ==========================================
  describe('Budget Allocator Controls', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
      await performLogin(driver, 'user@budget.com', 'Password123');
      const dashboard = new DashboardPage(driver);
      await dashboard.navigateToBudget();
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T601] Should display correct seeded budget categories in table', async function() {
      const text = await getTableTextWithWait(By.id('budget-table-body'), 'Food');
      expect(text).to.include('Food');
      expect(text).to.include('Housing');
      expect(text).to.include('Entertainment');
      expect(text).to.include('Utilities');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Validated initial seeded budget list', 'PASSED');
    });

    it('[T602] Should validate empty category select in budget form', async function() {
      const budMeta = appMetadata.forms.budget;
      const form = new DynamicFormPage(driver, 'Budget', budMeta);
      await form.fillField('limit', 5000);
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted empty category', 'SUCCESS');

      expect(await form.getFieldError('category')).to.include('Category is required');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted category field error message', 'PASSED');
    });

    it('[T603] Should validate positive limit constraint on budget limit', async function() {
      const budMeta = appMetadata.forms.budget;
      const form = new DynamicFormPage(driver, 'Budget', budMeta);
      await form.fillField('category', 'Entertainment');
      await form.fillField('limit', -10);
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted negative limit amount', 'SUCCESS');

      expect(await form.getFieldError('limit')).to.include('Limit must be greater than zero');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Asserted limit range validation error', 'PASSED');
    });

    it('[T604] Should successfully save and allocate new category budget limit', async function() {
      const budMeta = appMetadata.forms.budget;
      const form = new DynamicFormPage(driver, 'Budget', budMeta);
      
      await form.fillField('category', 'Other');
      await form.fillField('limit', 15000);
      await form.submit();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted valid budget allocation', 'SUCCESS');

      const successBanner = await findElementWithWait(By.id('budget-success-banner'));
      expect(await successBanner.getText()).to.include('successfully updated');

      const text = await getTableTextWithWait(By.id('budget-table-body'), 'Other');
      expect(text).to.include('Other');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified new budget limit in table list', 'PASSED');
    });

    it('[T605] Should successfully delete category budget allocation', async function() {
      // Seeded Food budget has ID 1, delete button is delete-budget-1
      const deleteBtn = await findElementWithWait(By.id('delete-budget-1'));
      await deleteBtn.click();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Clicked delete budget button', 'SUCCESS');

      await driver.wait(async () => {
        const tbody = await findElementWithWait(By.id('budget-table-body'));
        const text = await tbody.getText();
        return !text.includes('Food');
      }, 5000);

      const tbody = await findElementWithWait(By.id('budget-table-body'));
      expect(await tbody.getText()).to.not.include('Food');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified budget allocation deleted', 'PASSED');
    });
  });

  // ==========================================
  // 7. WEALTH DISTRIBUTION REPORTS MODULE (4 Tests)
  // ==========================================
  describe('Wealth Distribution Reports', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
      await performLogin(driver, 'user@budget.com', 'Password123');
      const dashboard = new DashboardPage(driver);
      await dashboard.navigateToReports();
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T701] Should display correct category distributions percentages', async function() {
      await driver.wait(async () => {
        const container = await driver.findElement(By.className('form-container'));
        const text = await container.getText();
        return text.includes('Housing');
      }, 5000);
      const container = await findElementWithWait(By.className('form-container'));
      const content = await container.getText();
      expect(content).to.include('Housing');
      expect(content).to.include('Food');
      expect(content).to.include('Utilities');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Validated category distribution matches', 'PASSED');
    });

    it('[T702] Should display correct calculated total spent value', async function() {
      const summarySpent = await findElementWithWait(By.id('reports-total-spent'));
      await driver.wait(async () => {
        const text = await summarySpent.getText();
        return text === '₹21,700';
      }, 5000);
      const val = await summarySpent.getText();
      expect(val).to.equal('₹21,700');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified total spent summary matches initial mock transactions', 'PASSED');
    });

    it('[T703] Should filter transactions when category selection is changed', async function() {
      const filter = await findElementWithWait(By.id('report-category-filter'));
      await filter.click();
      const option = await findElementWithWait(By.xpath("//option[@value='Housing']"));
      await option.click();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Selected Housing category filter', 'SUCCESS');

      await driver.wait(async () => {
        const tbody = await findElementWithWait(By.id('report-table-body'));
        const text = await tbody.getText();
        return text.includes('House Rent') && !text.includes('Organic Groceries');
      }, 5000);

      const tbody = await findElementWithWait(By.id('report-table-body'));
      const text = await tbody.getText();
      expect(text).to.include('House Rent');
      expect(text).to.not.include('Organic Groceries');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified ledger displays only Housing transaction', 'PASSED');
    });

    it('[T704] Should display all transactions when category filter is cleared', async function() {
      const filter = await findElementWithWait(By.id('report-category-filter'));
      await filter.click();
      const option = await findElementWithWait(By.xpath("//option[@value='']"));
      await option.click();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Cleared category filter selection', 'SUCCESS');

      await driver.wait(async () => {
        const tbody = await findElementWithWait(By.id('report-table-body'));
        const text = await tbody.getText();
        return text.includes('House Rent') && text.includes('Organic Groceries');
      }, 5000);

      const tbody = await findElementWithWait(By.id('report-table-body'));
      const text = await tbody.getText();
      expect(text).to.include('House Rent');
      expect(text).to.include('Organic Groceries');
      expect(text).to.include('Electricity Bill');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified ledger displays all transactions again', 'PASSED');
    });
  });

  // ==========================================
  // 8. PROFILE & SESSION MODULE (3 Tests)
  // ==========================================
  describe('Profile & Session Controls', function() {
    beforeEach(async function() {
      driver = await baseTest.setupTest(this);
      await performLogin(driver, 'user@budget.com', 'Password123');
      const dashboard = new DashboardPage(driver);
      await dashboard.navigateToProfile();
    });

    afterEach(async function() {
      await baseTest.teardownTest(this);
    });

    it('[T801] Should display active logged-in user email', async function() {
      const displayInput = await findElementWithWait(By.id('profile-email-display'));
      await driver.wait(async () => {
        const displayedEmail = await displayInput.getAttribute('value');
        return displayedEmail === 'user@budget.com';
      }, 5000);
      const displayedEmail = await displayInput.getAttribute('value');
      expect(displayedEmail).to.equal('user@budget.com');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified profile email address matches session', 'PASSED');
    });

    it('[T802] Should toggle preference switches and save profile successfully', async function() {
      const toggle = await findElementWithWait(By.id('profile-theme-toggle'));
      await toggle.click();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Clicked High Contrast theme switch', 'SUCCESS');

      const submitBtn = await findElementWithWait(By.id('profile-submit-btn'));
      await submitBtn.click();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Submitted profile preference configurations', 'SUCCESS');

      const banner = await findElementWithWait(By.id('profile-success-banner'));
      expect((await banner.getText()).toLowerCase()).to.include('preferences successfully saved');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified success toast banner content', 'PASSED');
    });

    it('[T803] Should terminate session on logout click and block access', async function() {
      const dashboard = new DashboardPage(driver);
      await dashboard.logout();
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Triggered console logout action', 'SUCCESS');

      const currentUrl = await dashboard.getCurrentUrl();
      expect(currentUrl).to.include('/login');

      // Attempt to access dashboard again
      await dashboard.visit(`${config.baseUrl}/dashboard`);
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Attempted to access protected /dashboard', 'SUCCESS');

      expect(await dashboard.getCurrentUrl()).to.include('/login');
      excelGenerator.addExecutionLog(new Date(), this.test.title, 'Verified routing block and redirection to login screen', 'PASSED');
    });
  });
});
