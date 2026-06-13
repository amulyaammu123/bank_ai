<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ac912e72-484d-4bf0-b0ec-4230a36ac603

## Run Locally

**Prerequisites:** [Android Studio](https://developer.android.com/studio)

1. Open Android Studio
2. Select **Open** and choose the directory containing this project
3. Allow Android Studio to fix any incompatibilities as it imports the project.
4. Create a file named `.env` in the project directory and set `GEMINI_API_KEY` in that file to your Gemini API key (see `.env.example` for an example)
5. Remove this line from the app's `build.gradle.kts` file: `signingConfig = signingConfigs.getByName("debugConfig")`
6. Run the app on an emulator or physical device

---

# Enterprise Appium E2E Test Automation Framework

This project includes a production-ready End-to-End (E2E) mobile test automation suite designed specifically for the **SafeBank AI** Android application. Built on modern QA automation standards, it utilizes the Page Object Model (POM) pattern for scalability, readability, and ease of maintenance.

## Automation Technology Stack
*   **Language:** JavaScript (ES6+)
*   **Runtime:** Node.js (v18+)
*   **Core Driver:** Appium 2.x
*   **Engine UI:** UiAutomator2 Driver
*   **Test Runner:** Mocha
*   **Assertion Library:** Chai
*   **Reporting:** Mochawesome (HTML/JSON) & ExcelJS (Styled Multi-sheet Spreadsheet)
*   **Logger:** Winston (Console and file system outputs)
*   **CI/CD Pipeline:** GitHub Actions (Self-contained emulator runner execution)

## Architecture & Directory Structure
```
project-root/
├── .github/workflows/
│   └── appium-e2e.yml       # GitHub Actions CI pipeline
├── config/
│   └── appium.config.js     # Server configurations and driver capabilities
├── pages/                   # Page Object Model (POM) layer
│   ├── base.page.js         # Base wrapper for element actions and waits
│   ├── login.page.js        # Locators and actions for login and OTP forms
│   ├── dashboard.page.js    # Bottom navigation and bento card elements
│   ├── sms.page.js          # SMS spam scanner input and result section
│   ├── call.page.js         # Incoming call simulator presets and warning actions
│   ├── report.page.js       # Fraud reporting forms
│   └── profile.page.js      # User details controls and Logout trigger
├── tests/                   # Mocha test suites
│   ├── baseSetup.js         # Bootstraps webdriverio and hooks for failure logs
│   ├── auth.test.js         # Tests login validations, guest mode, and session exit
│   ├── formValidation.test.js # Tests required inputs and report validation limits
│   ├── gestures.test.js     # Tests swiping, list scrolls, and scroll-to-element
│   └── e2eFlow.test.js      # Runs full integration E2E workflows
├── utilities/               # Framework utility scripts
│   ├── driverFactory.js     # Connects to devices, spawns sessions, detects adb
│   ├── gestures.js          # W3C actions for swiping, double tapping, long presses
│   ├── helpers.js           # Screenshot snapshots, logcat dumps, performance measurements
│   ├── logger.js            # Winston console and file logs writer
│   └── excelReporter.js     # Excel report engine utilizing ExcelJS
├── package.json             # NPM package scripts and dependencies
└── README.md                # System documentation
```

## Prerequisites for Automation

Before running tests, ensure your local system meets the following specifications:
1.  **Node.js**: Install Node.js (v18 or higher recommended).
2.  **Appium**: Install Appium globally:
    ```bash
    npm install -g appium@latest
    ```
3.  **Appium UiAutomator2 Driver**: Install the driver globally:
    ```bash
    appium driver install uiautomator2
    ```
4.  **Android SDK & Tools**: ADB must be configured and available on your system path.
5.  **Target Emulator/Device**: Set up an active Android emulator or connect a physical device via ADB (verify using `adb devices`).

## Setup and Installation

1. Clone or pull this repository.
2. In the project root, install Node.js dependencies:
   ```bash
   npm install
   ```
3. Make sure to build the Android debug APK first:
   * **Using Android Studio**: Build the debug variant (`Build > Make Project` or Gradle `./gradlew assembleDebug`).
   * **Via Command Line**:
     ```bash
     ./gradlew assembleDebug
     ```
     The APK is saved at `./app/build/outputs/apk/debug/app-debug.apk`.

## Local Test Execution

### Environment Variables
You can configure execution parameters by creating a `.env` file in the root directory:
```env
USE_APK=true
APK_PATH=./app/build/outputs/apk/debug/app-debug.apk
DEVICE_NAME=Android Emulator
PLATFORM_VERSION=13.0
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
```

### Running Test Scripts

Start the Appium server first in your terminal:
```bash
appium
```

In a new terminal window, execute the automated tests:
```bash
# Run all test suites
npm test

# Run individual test files
npm run test:auth
npm run test:validation
npm run test:gestures
npm run test:e2e
```

## Test Reporting

### 1. Excel Report (`excel/Mobile_E2E_Report.xlsx`)
At the end of each test run, the framework generates a styled Excel workbook containing four separate sheets:
*   **Summary**: Metrics including run dates, test totals, pass percentages, and runtime duration.
*   **Test Cases**: Breakdown of status (Passed/Failed), module, and duration for each test.
*   **Failed Tests**: Diagnostic logs detailing assertions, current activities, and screenshot references for failures.
*   **Execution Logs**: High-fidelity timeline mapping individual steps and remarks.

### 2. HTML Report (`reports/mochawesome-report/`)
Mochawesome compiles interactive web reports illustrating assertion traces, runtime logs, and test status visual charts.

### 3. Failure Screenshots & Logcat Logs (`reports/failures/`)
When any assertion fails, the framework automatically records:
*   **PNG Screenshot** of the active device screen.
*   **Logcat dump file (`.log`)** tracing Android system runtime messages leading up to the failure.

## CI/CD Pipeline Integration
Tests are automatically triggered via GitHub Actions (`.github/workflows/appium-e2e.yml`) on every push or pull request to the `main` or `dev` branches.
The runner builds the debug APK, sets up a Google API Android Emulator, runs the tests, and uploads the generated reports, logs, and screenshots directly as build artifacts.
