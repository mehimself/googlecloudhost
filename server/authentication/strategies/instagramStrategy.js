const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const authentication = require('../../../config/secrets/auth')
const InstagramStrategy = require('passport-instagram').Strategy
const User = require('../../database/User')

module.exports = new InstagramStrategy(secrets.instagram, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({instagram: profile.id}, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {msg: 'There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account.'})
        done(err)
      } else {
        User.findById(req.user.id, function (err, user) {
          if (err) logger.error(err)
          user.instagram = profile.id
          user.tokens.push({kind: 'instagram', accessToken: accessToken})
          user.profile.name = user.profile.name || profile.displayName
          user.profile.picture = user.profile.picture ||
                                 profile._json.data.profile_picture
          user.profile.website = user.profile.website ||
                                 profile._json.data.website
          user.isAdmin = authentication.admins[user.email] &&
                         !!authentication.admins[user.email].isAdmin
          user.save(function (err) {
            req.flash('info', {msg: 'Instagram account has been linked.'})
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({instagram: profile.id}, function (err, existingUser) {
      if (err) logger.error(err)
      if (existingUser) {
        return done(null, existingUser)
      }
      let user = new User()
      user.instagram = profile.id
      user.tokens.push({kind: 'instagram', accessToken: accessToken})
      user.profile.name = profile.displayName
      // Similar to Twitter API, assigns a temporary e-mail address
      // to get on with the registration process. It can be changed later
      // to a valid e-mail address in Profile Management.
      user.email = profile.username + '@instagram.com'
      user.profile.website = profile._json.data.website
      user.profile.picture = profile._json.data.profile_picture
      user.isAdmin = authentication.admins[user.email] &&
                     !!authentication.admins[user.email].isAdmin
      user.save(function (err) {
        done(err, user)
      })
    })
  }
})
