const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class ExcelGenerator {
  constructor() {
    this.summaryData = {};
    this.testCases = [];
    this.failedTests = [];
    this.executionLogs = [];
  }

  addTestCase(testId, moduleName, scenarioName, browser, status, startTime, endTime, duration) {
    this.testCases.push({
      testId,
      module: moduleName,
      scenarioName,
      browser,
      status,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      durationMs: duration
    });
  }

  addFailedTest(testId, failureReason, screenshotPath, browser, url) {
    this.failedTests.push({
      testId,
      failureReason,
      screenshotPath,
      browser,
      url
    });
  }

  addExecutionLog(timestamp, testName, stepDescription, result, remarks = '') {
    this.executionLogs.push({
      timestamp: timestamp.toISOString ? timestamp.toISOString() : timestamp,
      testName,
      stepDescription,
      result,
      remarks
    });
  }

  async generateReport(environment, startTime, endTime) {
    const reportDir = path.join(__dirname, '../excel');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const reportPath = path.join(reportDir, 'SafeBankAI_Test_Report.xlsx');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SafeBank AI E2E Automation Framework';
    workbook.created = new Date();

    const duration = `${((endTime - startTime) / 1000).toFixed(2)}s`;
    const totalTests = this.testCases.length;
    const passed = this.testCases.filter(t => t.status === 'PASSED').length;
    const failed = this.testCases.filter(t => t.status === 'FAILED').length;
    const skipped = this.testCases.filter(t => t.status === 'SKIPPED').length;
    const passPercentage = totalTests > 0 ? `${((passed / totalTests) * 100).toFixed(2)}%` : '0.00%';

    this.summaryData = {
      executionDate: new Date().toLocaleDateString(),
      environment,
      totalTests,
      passed,
      failed,
      skipped,
      passPercentage,
      duration
    };

    // ----------------------------------------------------
    // Sheet 1 – Summary
    // ----------------------------------------------------
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.views = [{ showGridLines: true }];
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    const metrics = [
      { metric: 'Execution Date', value: this.summaryData.executionDate },
      { metric: 'Environment', value: this.summaryData.environment },
      { metric: 'Total Tests', value: this.summaryData.totalTests },
      { metric: 'Passed', value: this.summaryData.passed },
      { metric: 'Failed', value: this.summaryData.failed },
      { metric: 'Skipped', value: this.summaryData.skipped },
      { metric: 'Pass Percentage', value: this.summaryData.passPercentage },
      { metric: 'Execution Duration', value: this.summaryData.duration }
    ];

    metrics.forEach(m => summarySheet.addRow(m));
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } }; // Dark blue

    summarySheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
      if (rowNumber > 1) {
        const mVal = row.getCell(1).value;
        if (mVal === 'Passed' && this.summaryData.passed > 0) {
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
          row.getCell(2).font = { color: { argb: '375623' }, bold: true };
        } else if (mVal === 'Failed' && this.summaryData.failed > 0) {
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8CBAD' } };
          row.getCell(2).font = { color: { argb: 'C00000' }, bold: true };
        } else if (mVal === 'Pass Percentage') {
          row.getCell(2).font = { bold: true };
        }
      }
    });

    // ----------------------------------------------------
    // Sheet 2 – Test Cases
    // ----------------------------------------------------
    const testCasesSheet = workbook.addWorksheet('Test Cases');
    testCasesSheet.views = [{ showGridLines: true }];
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 12 },
      { header: 'Module', key: 'module', width: 22 },
      { header: 'Scenario Name', key: 'scenarioName', width: 45 },
      { header: 'Browser', key: 'browser', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Start Time', key: 'startTime', width: 24 },
      { header: 'End Time', key: 'endTime', width: 24 },
      { header: 'Duration', key: 'duration', width: 12 }
    ];

    this.testCases.forEach(tc => testCasesSheet.addRow(tc));
    testCasesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    testCasesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };

    testCasesSheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
      if (rowNumber > 1) {
        const statVal = row.getCell(5);
        if (statVal.value === 'PASSED') {
          statVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
          statVal.font = { color: { argb: '375623' }, bold: true };
        } else if (statVal.value === 'FAILED') {
          statVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8CBAD' } };
          statVal.font = { color: { argb: 'C00000' }, bold: true };
        }
      }
    });

    // ----------------------------------------------------
    // Sheet 3 – Failed Cases
    // ----------------------------------------------------
    const failedCasesSheet = workbook.addWorksheet('Failed Cases');
    failedCasesSheet.views = [{ showGridLines: true }];
    failedCasesSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 12 },
      { header: 'Failure Reason', key: 'failureReason', width: 50 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 50 },
      { header: 'Browser', key: 'browser', width: 12 },
      { header: 'URL', key: 'url', width: 40 }
    ];

    this.failedTests.forEach(ft => failedCasesSheet.addRow(ft));
    failedCasesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    failedCasesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B91C1C' } }; // Soft red

    failedCasesSheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
      if (rowNumber > 1) {
        row.getCell(2).font = { color: { argb: 'C00000' } };
        const scCell = row.getCell(3);
        if (scCell.value) {
          scCell.font = { color: { argb: '0563C1' }, underline: true };
        }
      }
    });

    // ----------------------------------------------------
    // Sheet 4 – Execution Logs
    // ----------------------------------------------------
    const logsSheet = workbook.addWorksheet('Execution Logs');
    logsSheet.views = [{ showGridLines: true }];
    logsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 24 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Step Description', key: 'stepDescription', width: 50 },
      { header: 'Result', key: 'result', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 40 }
    ];

    this.executionLogs.forEach(el => logsSheet.addRow(el));
    logsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    logsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };

    logsSheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
      if (rowNumber > 1) {
        const resCell = row.getCell(4);
        if (resCell.value === 'PASSED' || resCell.value === 'SUCCESS') {
          resCell.font = { color: { argb: '375623' }, bold: true };
        } else if (resCell.value === 'FAILED') {
          resCell.font = { color: { argb: 'C00000' }, bold: true };
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9' } };
        }
      }
    });

    // ----------------------------------------------------
    // Sheet 5 – Browser Execution Results
    // ----------------------------------------------------
    const browserSheet = workbook.addWorksheet('Browser Execution Results');
    browserSheet.views = [{ showGridLines: true }];
    browserSheet.columns = [
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Total Executed', key: 'total', width: 15 },
      { header: 'Passed', key: 'passed', width: 15 },
      { header: 'Failed', key: 'failed', width: 15 },
      { header: 'Success Rate', key: 'rate', width: 15 },
      { header: 'Total Duration', key: 'duration', width: 18 }
    ];

    // Compute stats grouped by browser
    const browsersSeen = [...new Set(this.testCases.map(t => t.browser))];
    browsersSeen.forEach(b => {
      const bTests = this.testCases.filter(t => t.browser === b);
      const bPassed = bTests.filter(t => t.status === 'PASSED').length;
      const bFailed = bTests.filter(t => t.status === 'FAILED').length;
      const bDurationMs = bTests.reduce((acc, t) => acc + (t.durationMs || 0), 0);
      const bRate = bTests.length > 0 ? `${((bPassed / bTests.length) * 100).toFixed(2)}%` : '0.00%';

      browserSheet.addRow({
        browser: b,
        total: bTests.length,
        passed: bPassed,
        failed: bFailed,
        rate: bRate,
        duration: `${(bDurationMs / 1000).toFixed(2)}s`
      });
    });

    browserSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    browserSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };

    browserSheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
      if (rowNumber > 1) {
        const rateCell = row.getCell(5);
        rateCell.font = { bold: true };
        if (row.getCell(4).value === 0) {
          rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
          rateCell.font = { color: { argb: '375623' }, bold: true };
        } else {
          rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8CBAD' } };
          rateCell.font = { color: { argb: 'C00000' }, bold: true };
        }
      }
    });

    await workbook.xlsx.writeFile(reportPath);
    logger.info(`SafeBank AI E2E Excel report successfully generated at: ${reportPath}`);
  }
}

module.exports = new ExcelGenerator();
