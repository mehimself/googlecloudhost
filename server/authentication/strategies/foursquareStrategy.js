const logger = require('../../logger')
const secrets = require('../../../config/secrets/secrets')
const admins = require('../../../config/secrets/auth').admins
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy
const User = require('../../database/User')


module.exports = new OAuth2Strategy(
  {
    authorizationURL: 'https://foursquare.com/oauth2/authorize',
    tokenURL: 'https://foursquare.com/oauth2/access_token',
    clientID: secrets.foursquare.clientId,
    clientSecret: secrets.foursquare.clientSecret,
    callbackURL: secrets.foursquare.redirectUrl,
    passReqToCallback: true
  },
  function (req, accessToken, refreshToken, profile, done) {
    User.findById(req.user._id, function (err, user) {
      if (err) logger.error(err)
      user.tokens.push({kind: 'foursquare', accessToken: accessToken})
      user.isAdmin = admins[user.email] && !!admins[user.email].isAdmin
      user.save(function (err) {
        done(err, user)
      })
    })
  }
)
