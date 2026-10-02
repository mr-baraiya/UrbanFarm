const fs = require('fs');
const path = require('path');

// Determine if running in a serverless environment (Vercel / Lambda)
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

let logStream = null;

// Only attempt local file stream if not in serverless and directory is writable
if (!isServerless) {
  try {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });
    logStream.on('error', () => {
      // Ignore file stream errors silently in case of permissions
      logStream = null;
    });
  } catch (err) {
    logStream = null;
  }
}

const writeToStream = (log) => {
  if (logStream && typeof logStream.write === 'function') {
    try {
      logStream.write(log + '\n');
    } catch (_) {}
  }
};

const logger = {
  info: (message) => {
    const log = `[INFO] ${new Date().toISOString()} - ${message}`;
    console.log(log);
    writeToStream(log);
  },
  error: (message) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${message}`;
    console.error(log);
    writeToStream(log);
  },
  warn: (message) => {
    const log = `[WARN] ${new Date().toISOString()} - ${message}`;
    console.warn(log);
    writeToStream(log);
  },
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const log = `[DEBUG] ${new Date().toISOString()} - ${message}`;
      console.debug(log);
      writeToStream(log);
    }
  },
};

module.exports = logger;