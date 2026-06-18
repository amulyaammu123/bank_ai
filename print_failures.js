const fs = require('fs');
const path = require('path');

function printAnnotations() {
  console.log('=== STARTING FAILURES PARSER FOR WORKFLOW ANNOTATIONS ===');
  
  // 1. Check Mochawesome JSON report
  const reportPath = path.join(__dirname, 'reports/mochawesome-report.json');
  if (fs.existsSync(reportPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      const failures = [];
      
      const traverse = (suite) => {
        if (suite.tests && suite.tests.length > 0) {
          suite.tests.forEach(test => {
            if (test.fail) {
              failures.push(test);
            }
          });
        }
        if (suite.suites && suite.suites.length > 0) {
          suite.suites.forEach(traverse);
        }
      };
      
      if (data.results) {
        data.results.forEach(traverse);
      }
      
      if (failures.length > 0) {
        console.log(`Found ${failures.length} test failures:`);
        failures.forEach((test, idx) => {
          const cleanErr = (test.err.message || 'Unknown error').replace(/\n/g, ' ');
          // Print GitHub action error annotation
          console.log(`::error title=Failed Test #${idx + 1}::[${test.fullTitle}] -> ${cleanErr}`);
        });
      } else {
        console.log('No test failures found in Mochawesome JSON report.');
      }
    } catch (err) {
      console.log(`::warning::Failed to parse Mochawesome JSON report: ${err.message}`);
    }
  } else {
    console.log('::warning::Mochawesome JSON report not found.');
  }

  // 2a. Check Appium Startup Log
  const appiumStartupLogPath = path.join(__dirname, 'logs/appium_startup.log');
  if (fs.existsSync(appiumStartupLogPath)) {
    try {
      const logContent = fs.readFileSync(appiumStartupLogPath, 'utf-8');
      const lines = logContent.split('\n');
      const lastLines = lines.slice(-30).join(' | ').replace(/\n/g, ' ');
      console.log(`::error title=Appium Startup Log Tail::${lastLines}`);
    } catch (err) {
      console.log(`::warning::Failed to read Appium Startup Log: ${err.message}`);
    }
  }

  // 2b. Check Appium Server Log
  const appiumLogPath = path.join(__dirname, 'logs/appium_server.log');
  if (fs.existsSync(appiumLogPath)) {
    try {
      const logContent = fs.readFileSync(appiumLogPath, 'utf-8');
      const lines = logContent.split('\n');
      const lastLines = lines.slice(-30).join(' | ').replace(/\n/g, ' ');
      console.log(`::error title=Appium Server Tail::${lastLines}`);
    } catch (err) {
      console.log(`::warning::Failed to read Appium Server Log: ${err.message}`);
    }
  } else {
    console.log('::warning::Appium Server Log not found.');
  }

  // 3. Check Appium Execution Log
  const execLogPath = path.join(__dirname, 'logs/appium-execution.log');
  if (fs.existsSync(execLogPath)) {
    try {
      const logContent = fs.readFileSync(execLogPath, 'utf-8');
      const lines = logContent.split('\n');
      const lastLines = lines.slice(-30).join(' | ').replace(/\n/g, ' ');
      console.log(`::error title=Appium Execution Tail::${lastLines}`);
    } catch (err) {
      console.log(`::warning::Failed to read Appium Execution Log: ${err.message}`);
    }
  } else {
    console.log('::warning::Appium Execution Log not found.');
  }
}

printAnnotations();
