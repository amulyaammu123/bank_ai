# SafeBank AI Portal & Automation Suite

This repository contains two main projects:
1. **SafeBank AI Mobile (Android)**: Protecting elderly and rural users using offline intelligence (original source code).
2. **SafeBank AI E2E Test Automation Framework**: A production-ready, enterprise-grade Selenium WebDriver automation suite built with Node.js, JavaScript, Mocha, Chai, and ExcelJS.

---

## 🛡️ Part 1: Run and Deploy Your Android App

This contains everything you need to run your app locally.
View your app in AI Studio: https://ai.studio/apps/ac912e72-484d-4bf0-b0ec-4230a36ac603

### Run Locally

**Prerequisites:** [Android Studio](https://developer.android.com/studio)

1. Open Android Studio
2. Select **Open** and choose the directory containing this project
3. Allow Android Studio to fix any incompatibilities as it imports the project.
4. Create a file named `.env` in the project directory and set `GEMINI_API_KEY` in that file to your Gemini API key (see `.env.example` for an example)
5. Remove this line from the app's `build.gradle.kts` file: `signingConfig = signingConfigs.getByName("debugConfig")`
6. Run the app on an emulator or physical device.

---

## 🧪 Part 2: E2E Selenium WebDriver Automation Framework

An enterprise-standard automation architecture designed for testing React web applications, featuring **Dynamic Form & Route Discovery**, **Custom Multi-Sheet Excel Reports**, **Mochawesome HTML reports**, and **Failure Screenshot Interception**.

### Architecture & Directory Structure

```text
safebank-ai-website/
├── react-app/                 # Target React Web Application (Vite + Router)
│   ├── src/
│   │   ├── App.jsx            # Dynamically parses JSON metadata to build UI
│   │   └── index.css          # Premium Dark-Mode Glassmorphism styles
│   └── package.json
├── config/
│   ├── app-metadata.json      # Dynamic validation & routing rules (Single Source of Truth)
│   └── config.js              # Environment settings parser (.env)
├── tests/
│   ├── base-test.js           # Browser setup, failure screenshot hook, and reports logs collector
│   └── dynamic-tests.spec.js  # Dynamic Mocha test runner
├── pages/
│   ├── base-page.js           # Common Selenium Utility Layer (Waits, JS, scrolling, alerts)
│   ├── login-page.js          # Authentication Page Object
│   ├── dashboard-page.js      # Dashboard widgets Page Object (modals, toasts, tables, tooltips)
│   └── dynamic-form-page.js   # Metadata-driven form Page Object
├── utilities/
│   ├── driver-factory.js      # Browser driver config loader (Chrome/Firefox/Edge)
│   ├── logger.js              # Winston logger (console + log files)
│   └── excel-generator.js     # ExcelJS reporting spreadsheet generator
├── excel/                     # Directory for generated Excel spreadsheets
├── logs/                      # Executions logs output folder
├── reports/                   # HTML & screenshot failure reports
├── .github/workflows/
│   └── selenium-e2e.yml       # GitHub Actions workflow
├── .env                       # Local execution settings config
└── package.json               # Root node dependencies config
```

### Key Capabilities

1. **Dynamic Form & Route Testing**: Both the React application and the automation tests import `config/app-metadata.json` as their single source of truth. When new fields or validation rules are added to this file, the React UI is instantly updated, and Mocha dynamically generates new validation checks.
2. **Robust Selenium Utility Layer**: The `BasePage` encapsulates explicit driver waits, scrolling, alert managers, window transitions, and automated page element syncs.
3. **Advanced Failures Interception**: On any failure:
   - Captures a screen layout screenshot into `reports/failures/`.
   - Saves browser console errors, active URL, and stack trace in `reports/failures/console_{test}.txt`.
4. **Rich Multi-Sheet Excel Reporting**: Autogenerates a stylized `excel/E2E_Report.xlsx` containing:
   - **Summary Sheet**: Execution date, counts, duration, and colored pass metrics.
   - **Test Cases Sheet**: Run history by module, scenario, browser, and duration.
   - **Failed Tests Sheet**: Reason, URL, and relative screenshot file links.
   - **Execution Logs Sheet**: Deep breakdown of every transaction step.

---

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or 18 recommended)
- Google Chrome, Microsoft Edge, or Firefox browser installed on your computer.

### Local Installation & Running Instructions

1. **Clone and Install Root Automation Dependencies**:
   ```bash
   npm install
   ```

2. **Setup and Build the Target React Web App**:
   ```bash
   # Install dependencies in the react-app directory
   npm run setup:app
   
   # Build the React web app
   npm run build:app
   ```

3. **Configure Environment variables** (Optional, defaults are configured in `.env` and `config/config.js`):
   Edit `.env` in the root folder to switch browser or run modes:
   ```env
   BROWSER=chrome        # Options: chrome, firefox, edge
   HEADLESS=true         # Options: true (invisible browser), false (visible UI browser)
   BASE_URL=http://localhost:5173
   TIMEOUT=10000
   RETRY_COUNT=1
   ENVIRONMENT=QA
   ```

4. **Run E2E Tests Locally**:
   To run both the React App server and execute the Mocha Selenium test scripts concurrently:
   ```bash
   npm run test:ci
   ```
   *Note: This command will boot up the local Vite server on port 5173, verify it is running, launch Selenium WebDrivers in headless mode, execute the suite, save the Excel/HTML reports, and cleanly close the servers when finished.*

### Alternative Local Commands
- **Run in headed mode** (opens the browser visually):
  Make sure you start the app first using `npm run start:app` in one terminal, then in another terminal run:
  ```bash
  npm run test:headed
  ```
- **Run on Firefox**:
  ```bash
  npm run start:app
  # then:
  npm run test:firefox
  ```
- **Run on MS Edge**:
  ```bash
  npm run start:app
  # then:
  npm run test:edge
  ```

---

## 📈 Reports & Outputs

- **Excel Report**: Located under `excel/E2E_Report.xlsx`.
- **HTML Report**: Located under `mochawesome-report/mochawesome.html`.
- **Screenshots & Console logs**: Located under `reports/failures/`.
- **Execution step logs**: Located under `logs/app.log`.
