const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const admins = require('../../../config/secrets/auth').admins
const LocalStrategy = require('passport-local').Strategy
const User = require('../../database/User')

module.exports = new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
  console.log('passport: using local strategy')
  email = email.toLowerCase()
  User.findOne({email: email}, function (err, user) {
    if (err) logger.error(err)
    if (!user) {
      return done(null, false, {message: 'Email ' + email + ' not found'})
    }
    user.comparePassword(password, function (err, isMatch) {
      if (err) logger.error(err)
      if (isMatch) {
        user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
        return done(null, user)
      } else {
        return done(null, false, {message: 'Invalid email or password.'})
      }
    })
  })
})
