const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const admins = require('../../../config/secrets/auth').admins
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy
const User = require('../../database/User')

module.exports = new LinkedInStrategy(secrets.linkedin, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({linkedin: profile.id}, function (err, existingUser) {
      if (err) logger.error(err)
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a LinkedIn account that belongs to you. Sign in with that account or delete it, then link it with your current account.'})
        done(err)
      } else {
        User.findById(req.user.id, function (err, user) {
          if (err) logger.error(err)
          user.linkedin = profile.id
          user.tokens.push({kind: 'linkedin', accessToken: accessToken})
          user.profile.name = user.profile.name || profile.displayName
          user.profile.location = user.profile.location || profile._json.location.name
          user.profile.picture = user.profile.picture || profile._json.pictureUrl
          user.profile.website = user.profile.website || profile._json.publicProfileUrl
          user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
          user.save(function (err) {
            req.flash('info', {msg: 'LinkedIn account has been linked.'})
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({linkedin: profile.id}, function (err, existingUser) {
      if (err) logger.error(err)
      if (existingUser) {
        return done(null, existingUser)
      }
      User.findOne({email: profile._json.emailAddress}, function (err, existingEmailUser) {
        if (err) logger.error(err)
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with LinkedIn manually from Account Settings.'})
          done(err)
        } else {
          let user = new User()
          user.linkedin = profile.id
          user.tokens.push({kind: 'linkedin', accessToken: accessToken})
          user.email = profile._json.emailAddress
          user.profile.name = profile.displayName
          user.profile.location = profile._json.location.name
          user.profile.picture = profile._json.pictureUrl
          user.profile.website = profile._json.publicProfileUrl
          user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
          user.save(function (err) {
            done(err, user)
          })
        }
      })
    })
  }
})
