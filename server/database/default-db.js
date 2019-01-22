const logger = require('../logger')
function createDefaultUser () {
  const User = require('./User/model')
  const defaultAdmin = require('./../../config/secrets/defaultAdmin')
  User.find({}).exec().then((docs) => {
    if (docs.length === 0) {
      logger.warn('Loading default Users to DB...')

      let users = []
      let admin = new User(defaultAdmin)
      users.push(admin.save())
    }
  }).catch((err) => {
    logger.error(err)
  }).then(() => {
    logger.debug('Seeding done!')
  })
}

module.exports = createDefaultUser
