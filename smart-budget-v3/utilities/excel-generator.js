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
      duration: `${(duration / 1000).toFixed(2)}s`
    });
  }

  addFailedTest(testName, failureReason, screenshotPath, browser, url) {
    this.failedTests.push({
      testName,
      failureReason,
      screenshotPath,
      browser,
      url
    });
  }

  addExecutionLog(timestamp, testName, stepDescription, result, remarks) {
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
    const reportPath = path.join(reportDir, 'E2E_Report.xlsx');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SafeBank E2E Automation Framework';
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
    // Sheet 1: Summary
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

    // Style Summary Sheet Headers and rows
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2F5597' } // Premium Dark Blue
    };

    summarySheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
      
      // Color Pass Percentage row or Pass/Fail counts
      if (rowNumber > 1) {
        const metricVal = row.getCell(1).value;
        if (metricVal === 'Passed' && this.summaryData.passed > 0) {
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }; // Soft green
          row.getCell(2).font = { color: { argb: '375623' }, bold: true };
        } else if (metricVal === 'Failed' && this.summaryData.failed > 0) {
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8CBAD' } }; // Soft red
          row.getCell(2).font = { color: { argb: 'C00000' }, bold: true };
        } else if (metricVal === 'Pass Percentage') {
          row.getCell(2).font = { bold: true };
        }
      }
    });

    // ----------------------------------------------------
    // Sheet 2: Test Cases
    // ----------------------------------------------------
    const testCasesSheet = workbook.addWorksheet('Test Cases');
    testCasesSheet.views = [{ showGridLines: true }];
    
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 12 },
      { header: 'Module', key: 'module', width: 18 },
      { header: 'Scenario Name', key: 'scenarioName', width: 40 },
      { header: 'Browser', key: 'browser', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Start Time', key: 'startTime', width: 24 },
      { header: 'End Time', key: 'endTime', width: 24 },
      { header: 'Duration', key: 'duration', width: 12 }
    ];

    this.testCases.forEach(tc => testCasesSheet.addRow(tc));

    testCasesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    testCasesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2F5597' }
    };

    testCasesSheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };

      if (rowNumber > 1) {
        const statusCell = row.getCell(5);
        if (statusCell.value === 'PASSED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } };
          statusCell.font = { color: { argb: '375623' }, bold: true };
        } else if (statusCell.value === 'FAILED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8CBAD' } };
          statusCell.font = { color: { argb: 'C00000' }, bold: true };
        } else if (statusCell.value === 'SKIPPED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } };
          statusCell.font = { color: { argb: '7F6000' }, bold: true };
        }
      }
    });

    // ----------------------------------------------------
    // Sheet 3: Failed Tests
    // ----------------------------------------------------
    const failedTestsSheet = workbook.addWorksheet('Failed Tests');
    failedTestsSheet.views = [{ showGridLines: true }];

    failedTestsSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 40 },
      { header: 'Failure Reason', key: 'failureReason', width: 50 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 50 },
      { header: 'Browser', key: 'browser', width: 12 },
      { header: 'URL', key: 'url', width: 40 }
    ];

    this.failedTests.forEach(ft => failedTestsSheet.addRow(ft));

    failedTestsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    failedTestsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C00000' } // Crimson for failed tests
    };

    failedTestsSheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
      if (rowNumber > 1) {
        row.getCell(2).font = { color: { argb: 'C00000' } };
        // Highlight screenshot path cell to look like a file link
        const screenshotCell = row.getCell(3);
        if (screenshotCell.value) {
          screenshotCell.font = { color: { argb: '0563C1' }, underline: true };
        }
      }
    });

    // ----------------------------------------------------
    // Sheet 4: Execution Logs
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
    logsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2F5597' }
    };

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
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9' } }; // Soft light red for entire failed step row
        } else if (resCell.value === 'WARNING') {
          resCell.font = { color: { argb: '7F6000' }, bold: true };
        }
      }
    });

    await workbook.xlsx.writeFile(reportPath);
    logger.info(`Excel report successfully generated at: ${reportPath}`);
  }
}

// Export a singleton instance to share across tests
module.exports = new ExcelGenerator();
