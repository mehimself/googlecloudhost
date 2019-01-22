const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const admins = require('../../../config/secrets/auth').admins
const OAuthStrategy = require('passport-oauth').OAuthStrategy
const User = require('../../database/User')


module.exports = new OAuthStrategy(
  {
    requestTokenURL: 'http://www.tumblr.com/oauth/request_token',
    accessTokenURL: 'http://www.tumblr.com/oauth/access_token',
    userAuthorizationURL: 'http://www.tumblr.com/oauth/authorize',
    consumerKey: secrets.tumblr.consumerKey,
    consumerSecret: secrets.tumblr.consumerSecret,
    callbackURL: secrets.tumblr.callbackURL,
    passReqToCallback: true
  },
  function (req, token, tokenSecret, profile, done) {
    User.findById(req.user._id, function (err, user) {
      if (err) logger.error(err)
      user.tokens.push({kind: 'tumblr', accessToken: token, tokenSecret: tokenSecret})
      user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
      user.save(function (err) {
        done(err, user)
      })
    })
  }
)
