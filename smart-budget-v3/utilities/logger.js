const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure log directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${stack ? `\nStack: ${stack}` : ''}`;
  })
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `[${timestamp}] ${level}: ${message} ${stack ? `\nStack: ${stack}` : ''}`;
        })
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Helper for test execution logging
logger.logStep = (testName, stepDescription, result = 'SUCCESS', remarks = '') => {
  const msg = `[${testName}] - ${stepDescription} | Result: ${result} | Remarks: ${remarks}`;
  if (result === 'FAILED') {
    logger.error(msg);
  } else if (result === 'WARNING') {
    logger.warn(msg);
  } else {
    logger.info(msg);
  }
};

module.exports = logger;
