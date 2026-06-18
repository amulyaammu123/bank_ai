require('dotenv').config();

module.exports = {
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false', // defaults to true
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  timeout: parseInt(process.env.TIMEOUT || '10000', 10),
  environment: process.env.ENVIRONMENT || 'QA'
};
