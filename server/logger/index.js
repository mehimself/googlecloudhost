let winston = require('winston')
let path = require('path')
let fs = require('fs')
let mkdirp = require('mkdirp')

let config = require('../../config/logging')

let transports = []

/**
 * Console transporter
 */
transports.push(new winston.transports.Console({
  level: config.console.level,
  colorize: true,
  prettyPrint: true,
  handleExceptions: process.env.NODE_ENV === 'production'
}))

/**
 * File transporter
 */
if (config.file.enabled) {
  // Create logs directory
  let logDir = config.file.path
  if (!fs.existsSync(logDir)) {
    mkdirp(logDir)
  }

  transports.push(new (require('winston-daily-rotate-file'))({
    filename: path.join(logDir, 'server.log'),
    level: config.file.level || 'info',
    timestamp: true,
    json: config.file.json || false,
    handleExceptions: true
  }))

  if (config.file.exceptionFile) {
    transports.push(new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      level: 'error',
      timestamp: true,
      json: config.file.json || false,
      prettyPrint: true,
      handleExceptions: true,
      humanReadableUnhandledException: true
    }))
  }
}

let logger = winston.createLogger({
  level: 'debug',
  transports: transports,
  exitOnError: false
})

module.exports = logger
