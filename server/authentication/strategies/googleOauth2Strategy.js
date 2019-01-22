const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const admins = require('../../../config/secrets/auth').admins
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const User = require('../../database/User')

module.exports = new GoogleStrategy(secrets.google, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({google: profile.id}, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'})
        done(err)
      } else {
        User.findById(req.user.id, function (err, user) {
          if (err) logger.error(err)
          user.google = profile.id
          user.tokens.push({kind: 'google', accessToken: accessToken})
          user.profile.name = user.profile.name || profile.displayName
          user.profile.gender = user.profile.gender || profile._json.gender
          user.profile.picture = user.profile.picture || profile._json.image.url
          user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
          user.save(function (err) {
            req.flash('info', {msg: 'Google account has been linked.'})
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({google: profile.id}, function (err, existingUser) {
      if (err) logger.error(err)
      if (existingUser) {
        return done(null, existingUser)
      }
      User.findOne({email: profile.emails[0].value}, function (err, existingEmailUser) {
        if (err) logger.error(err)
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'})
          done(err)
        } else {
          let user = new User()
          user.email = profile.emails[0].value
          user.google = profile.id
          user.tokens.push({kind: 'google', accessToken: accessToken})
          user.profile.name = profile.displayName
          user.profile.gender = profile._json.gender
          user.profile.picture = profile._json.image.url
          user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
          user.save(function (err) {
            done(err, user)
          })
        }
      })
    })
  }
})
