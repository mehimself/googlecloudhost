const logger = require('../logger')
const config = require('../../config/secrets/database')
const chalk = require('chalk')

const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)

// mongoose.set('useFindAndModify', false);

function setupMongoose() {
  let db

  logger.info({})

  mongoose.Promise = global.Promise
  logger.warn('mongoose connection', mongoose.connection.readyState)
  if (mongoose.connection.readyState !== 1) {
    logger.info('Connecting to Mongo ' + config.uri + '...')
    db = mongoose.connect(config.uri, config.options, function mongoAfterConnect(err) {
      if (err) {
        logger.error('Could not connect to MongoDB!')
        return logger.error(err)
      }
      mongoose.set('debug', true)
    })

    mongoose.connection.on('error', function mongoConnectionError(err) {
      if (err.message.code === 'ETIMEDOUT') {
        logger.warn('Mongo connection timeout!', err)
        setTimeout(() => {
          mongoose.createConnection(config.uri, config.options)
        }, 1000)
        return
      }

      logger.error('Could not connect to MongoDB!')
      return logger.error(err)
    })

    mongoose.connection.once('open', function mongoAfterOpen() {
      logger.info(chalk.yellow.bold('Mongo DB connected.'))
      const createDefaultUser = require('./default-db')
      createDefaultUser()
    })
  } else {
    logger.info('Mongo already connected.')
    db = mongoose
  }

  return mongoose.connection
}
module.exports = setupMongoose()

