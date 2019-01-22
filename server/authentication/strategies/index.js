const passport = require('passport')
const User = require('../../database/User')

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

passport.use(require('./localStrategy'))
passport.use(require('./gitHubStrategy'))
passport.use(require('./googleOauth2Strategy'))

// passport.use(require('./instagramStrategy'))
// passport.use(require('./facebookStrategy'))
// passport.use(require('./twitterStrategy'))
// passport.use('tumblr', require('./tumblrStrategy'))
// passport.use('foursquare', require('./foursquareStrategy'))
// passport.use('venmo', require('./venmoStrategy'))

/**
 * Login Required middleware.
 */
exports.isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = function (req, res, next) {
  const provider = req.path.split('/').slice(-1)[0]
  if (_.find(req.user.tokens, {kind: provider})) {
    next()
  } else {
    res.redirect('/auth/' + provider)
  }
}
