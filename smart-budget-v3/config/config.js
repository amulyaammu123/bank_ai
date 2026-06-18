const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true',
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  timeout: parseInt(process.env.TIMEOUT || '10000', 10),
  retryCount: parseInt(process.env.RETRY_COUNT || '1', 10),
  environment: process.env.ENVIRONMENT || 'QA'
};
