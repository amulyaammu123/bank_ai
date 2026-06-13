const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class ExcelReporter {
  constructor() {
    this.testCases = [];
    this.failedTests = [];
    this.logs = [];
    this.startTime = new Date();
  }

  // Singleton instance
  static getInstance() {
    if (!global.excelReporterInstance) {
      global.excelReporterInstance = new ExcelReporter();
    }
    return global.excelReporterInstance;
  }

  /**
   * Log a specific step in a test
   */
  logStep(testName, step, result, remarks = '') {
    this.logs.push({
      timestamp: new Date().toISOString(),
      testName,
      step,
      result,
      remarks
    });
    logger.info(`[Step Log] ${testName} -> ${step}: ${result} (${remarks})`);
  }

  /**
   * Add a completed test case result
   */
  addTestCase(testId, module, scenario, device, status, startTime, endTime) {
    const duration = ((endTime - startTime) / 1000).toFixed(2) + 's';
    this.testCases.push({
      testId,
      module,
      scenario,
      device,
      status,
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString(),
      duration
    });
  }

  /**
   * Record details for a failed test
   */
  addFailedTest(testName, failureReason, screenshotPath, device, androidVersion, activityName) {
    this.failedTests.push({
      testName,
      failureReason,
      screenshotPath,
      device,
      androidVersion,
      activityName
    });
  }

  /**
   * Compiles the data and generates the styled Excel file
   */
  async generateReport(deviceName = 'Android Emulator', androidVersion = '13.0') {
    const reportDir = path.resolve(__dirname, '../excel');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const reportPath = path.join(reportDir, 'Mobile_E2E_Report.xlsx');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SafeBank QA Architect';
    workbook.created = new Date();

    const endTime = new Date();
    const totalDuration = ((endTime - this.startTime) / 1000).toFixed(2) + 's';
    const totalTests = this.testCases.length;
    const passed = this.testCases.filter(t => t.status === 'Passed').length;
    const failed = this.testCases.filter(t => t.status === 'Failed').length;
    const skipped = this.testCases.filter(t => t.status === 'Skipped').length;
    const passPercentage = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) + '%' : '0.0%';

    // Styling Tokens
    const primaryBlue = '1A237E';
    const accentGrey = 'ECEFF1';
    const passGreen = 'E8F5E9';
    const passText = '2E7D32';
    const failRed = 'FFEBEE';
    const failText = 'C62828';
    const fontName = 'Segoe UI';

    // ----------------------------------------------------
    // SHEET 1: Summary
    // ----------------------------------------------------
    const wsSummary = workbook.addWorksheet('Summary');
    wsSummary.views = [{ showGridLines: true }];

    wsSummary.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    const summaryRows = [
      { metric: 'Execution Date', value: new Date().toLocaleDateString() },
      { metric: 'Device Name', value: deviceName },
      { metric: 'Android Version', value: androidVersion },
      { metric: 'Total Tests', value: totalTests },
      { metric: 'Passed', value: passed },
      { metric: 'Failed', value: failed },
      { metric: 'Skipped', value: skipped },
      { metric: 'Pass Percentage', value: passPercentage },
      { metric: 'Execution Duration', value: totalDuration }
    ];

    wsSummary.addRows(summaryRows);

    // Style Summary Sheet
    wsSummary.getRow(1).font = { name: fontName, size: 12, bold: true, color: { argb: 'FFFFFF' } };
    wsSummary.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } };
    
    wsSummary.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.font = { name: fontName, size: 11 };
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentGrey } };
        row.getCell(1).font = { name: fontName, bold: true };
        
        // Highlight Pass Percentage or Fails
        const val = row.getCell(2).value;
        if (row.getCell(1).value === 'Pass Percentage') {
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: passed === totalTests ? passGreen : 'FFF9C4' } };
          row.getCell(2).font = { bold: true };
        } else if (row.getCell(1).value === 'Failed' && failed > 0) {
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: failRed } };
          row.getCell(2).font = { bold: true, color: { argb: failText } };
        } else if (row.getCell(1).value === 'Passed' && passed > 0) {
          row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: passGreen } };
          row.getCell(2).font = { bold: true, color: { argb: passText } };
        }
      }
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.height = 24;
    });

    // ----------------------------------------------------
    // SHEET 2: Test Cases
    // ----------------------------------------------------
    const wsTestCases = workbook.addWorksheet('Test Cases');
    wsTestCases.views = [{ showGridLines: true }];

    wsTestCases.columns = [
      { header: 'Test ID', key: 'testId', width: 12 },
      { header: 'Module', key: 'module', width: 18 },
      { header: 'Scenario', key: 'scenario', width: 35 },
      { header: 'Device', key: 'device', width: 22 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Start Time', key: 'startTime', width: 15 },
      { header: 'End Time', key: 'endTime', width: 15 },
      { header: 'Duration', key: 'duration', width: 12 }
    ];

    this.testCases.forEach(tc => wsTestCases.addRow(tc));

    // Style Test Cases sheet
    wsTestCases.getRow(1).font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
    wsTestCases.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } };
    wsTestCases.getRow(1).height = 26;

    wsTestCases.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.font = { name: fontName, size: 10 };
        row.height = 22;
        const statusCell = row.getCell(5);
        if (statusCell.value === 'Passed') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: passGreen } };
          statusCell.font = { bold: true, color: { argb: passText } };
        } else if (statusCell.value === 'Failed') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: failRed } };
          statusCell.font = { bold: true, color: { argb: failText } };
        } else {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5F5F5' } };
          statusCell.font = { italic: true };
        }
      }
      row.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // ----------------------------------------------------
    // SHEET 3: Failed Tests
    // ----------------------------------------------------
    const wsFailed = workbook.addWorksheet('Failed Tests');
    wsFailed.views = [{ showGridLines: true }];

    wsFailed.columns = [
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Failure Reason', key: 'failureReason', width: 45 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 40 },
      { header: 'Device', key: 'device', width: 22 },
      { header: 'Android Version', key: 'androidVersion', width: 15 },
      { header: 'Activity Name', key: 'activityName', width: 25 }
    ];

    this.failedTests.forEach(ft => wsFailed.addRow(ft));

    // Style Failed Tests sheet
    wsFailed.getRow(1).font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
    wsFailed.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B71C1C' } }; // Warning Crimson Red
    wsFailed.getRow(1).height = 26;

    wsFailed.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.font = { name: fontName, size: 10, color: { argb: 'B71C1C' } };
        row.height = 22;
        row.getCell(2).font = { size: 9, italic: true };
      }
      row.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // ----------------------------------------------------
    // SHEET 4: Execution Logs
    // ----------------------------------------------------
    const wsLogs = workbook.addWorksheet('Execution Logs');
    wsLogs.views = [{ showGridLines: true }];

    wsLogs.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 24 },
      { header: 'Test Name', key: 'testName', width: 28 },
      { header: 'Step', key: 'step', width: 30 },
      { header: 'Result', key: 'result', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 35 }
    ];

    this.logs.forEach(l => wsLogs.addRow(l));

    // Style Logs sheet
    wsLogs.getRow(1).font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
    wsLogs.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '37474F' } }; // Slate Gray
    wsLogs.getRow(1).height = 26;

    wsLogs.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.font = { name: fontName, size: 9 };
        row.height = 20;
        const resCell = row.getCell(4);
        if (resCell.value === 'PASS' || resCell.value === 'SUCCESS') {
          resCell.font = { bold: true, color: { argb: passText } };
        } else if (resCell.value === 'FAIL' || resCell.value === 'ERROR') {
          resCell.font = { bold: true, color: { argb: failText } };
        }
      }
      row.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Write file
    await workbook.xlsx.writeFile(reportPath);
    logger.info(`Excel report compiled and written to: ${reportPath}`);
  }
}

module.exports = ExcelReporter;
