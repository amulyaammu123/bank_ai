const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure log directory exists
const logDirectory = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // Filter out internal winston symbol keys
  const extraKeys = Object.keys(metadata).filter(k => k !== 'timestamp');
  let msg = `[${timestamp || new Date().toISOString()}] [${level}]: ${message}`;
  if (extraKeys.length > 0) {
    const extra = {};
    extraKeys.forEach(k => { extra[k] = metadata[k]; });
    msg += ` ${JSON.stringify(extra)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        customFormat
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'appium-execution.log'),
      maxsize: 5242880, // 5MB limit
      maxFiles: 5
    })
  ]
});

module.exports = logger;
