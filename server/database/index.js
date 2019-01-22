const mongoose = require('mongoose')
const databaseConfig = require('../../config/secrets/database')
const CONNECTED = 1

async function initializeConnection() {
  let connection = mongoose.connection
  if (connection.readyState !== CONNECTED) {
    connection = await mongoose.connect(databaseConfig.uri, function (err) {
      if (err) {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.')
        process.exit(1)
      } else {
        console.log('mongoDB connected successfully')
      }
    })
  }
  return connection
}


module.exports = initializeConnection()

