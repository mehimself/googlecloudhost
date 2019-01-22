const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const admins = require('../../../config/secrets/auth').admins
const TwitterStrategy = require('passport-twitter').Strategy
const User = require('../../database/User')

module.exports = new TwitterStrategy(secrets.twitter, function (req, accessToken, tokenSecret, profile, done) {
  if (req.user) {
    User.findOne({twitter: profile.id}, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.'})
        done(err)
      } else {
        User.findById(req.user.id, function (err, user) {
          if (err) logger.error(err)
          user.twitter = profile.id
          user.tokens.push({kind: 'twitter', accessToken: accessToken, tokenSecret: tokenSecret})
          user.profile.name = user.profile.name || profile.displayName
          user.profile.location = user.profile.location || profile._json.location
          user.profile.picture = user.profile.picture || profile._json.profile_image_url_https
          user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
          user.save(function (err) {
            req.flash('info', {msg: 'Twitter account has been linked.'})
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({twitter: profile.id}, function (err, existingUser) {
      if (err) logger.error(err)
      if (existingUser) {
        return done(null, existingUser)
      }
      let user = new User()
      // Twitter will not provide an email address.  Period.
      // But a person’s twitter username is guaranteed to be unique
      // so we can "fake" a twitter email address as follows:
      user.email = profile.username + '@twitter.com'
      user.twitter = profile.id
      user.tokens.push({kind: 'twitter', accessToken: accessToken, tokenSecret: tokenSecret})
      user.profile.name = profile.displayName
      user.profile.location = profile._json.location
      user.profile.picture = profile._json.profile_image_url_https
      user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
      user.save(function (err) {
        done(err, user)
      })
    })
  }
})
