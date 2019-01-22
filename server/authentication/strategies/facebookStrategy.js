const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const authentication = require('../../../config/secrets/auth')
const FacebookStrategy = require('passport-facebook').Strategy
const User = require('../../database/User')

module.exports = new FacebookStrategy(secrets.facebook, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({facebook: profile.id}, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.'})
        done(err)
      } else {
        User.findById(req.user.id, function (err, user) {
          if (err) logger.error(err)
          user.facebook = profile.id
          user.tokens.push({kind: 'facebook', accessToken: accessToken})
          user.profile.name = user.profile.name || profile.displayName
          user.profile.gender = user.profile.gender || profile._json.gender
          user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large'
          user.isAdmin = authentication.admins[user.email] && !!authentication.admins[user.email].isAdmin
          user.save(function (err) {
            req.flash('info', {msg: 'Facebook account has been linked.'})
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({facebook: profile.id}, function (err, existingUser) {
      if (err) logger.error(err)
      if (existingUser) {
        return done(null, existingUser)
      }
      User.findOne({email: profile._json.email}, function (err, existingEmailUser) {
        if (err) logger.error(err)
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'})
          done(err)
        } else {
          let user = new User()
          user.email = profile._json.email
          user.facebook = profile.id
          user.tokens.push({kind: 'facebook', accessToken: accessToken})
          user.profile.name = profile.displayName
          user.profile.gender = profile._json.gender
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large'
          user.profile.location = (profile._json.location) ? profile._json.location.name : ''
          user.isAdmin = authentication.admins[user.email] && !!authentication.admins[user.email].isAdmin
          user.save(function (err) {
            done(err, user)
          })
        }
      })
    })
  }
})
