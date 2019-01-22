const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const admins = require('../../../config/secrets/auth').admins
const GitHubStrategy = require('passport-github').Strategy
const User = require('../../database/User')

module.exports = new GitHubStrategy(secrets.github, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({github: profile.id}, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account.'})
        done(err)
      } else {
        User.findById(req.user.id, function (err, user) {
          if (err) logger.error(err)
          user.github = profile.id
          user.tokens.push({kind: 'github', accessToken: accessToken})
          user.profile.name = user.profile.name || profile.displayName
          user.profile.picture = user.profile.picture || profile._json.avatar_url
          user.profile.location = user.profile.location || profile._json.location
          user.profile.website = user.profile.website || profile._json.blog
          user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
          user.save(function (err) {
            req.flash('info', {msg: 'GitHub account has been linked.'})
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({github: profile.id}, function (err, existingUser) {
      if (err) logger.error(err)
      if (existingUser) {
        return done(null, existingUser)
      }
      User.findOne({email: profile._json.email}, function (err, existingEmailUser) {
        if (err) logger.error(err)
        if (existingEmailUser) {
          req.flash('errors', {msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.'})
          done(err)
        } else {
          var user = new User()
          user.email = profile._json.email
          user.github = profile.id
          user.tokens.push({kind: 'github', accessToken: accessToken})
          user.profile.name = profile.displayName
          user.profile.picture = profile._json.avatar_url
          user.profile.location = profile._json.location
          user.profile.website = profile._json.blog
          user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
          user.save(function (err) {
            done(err, user)
          })
        }
      })
    })
  }
})
