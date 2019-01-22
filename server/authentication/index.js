// todo: deprecate, use data/user




let config = require('../../config/secrets/auth')
let logger = require('../logger')

let crypto = require('crypto')
let async = require('async')

let passport = require('passport')
let express = require('express')

let mailer = require('../smtp')
let User = require('../database/User/model')
let Response = require('../responseFallbacks')

/**
 * Generate JSON or HTML response to client,
 * If browser accept JSON and not HTML, we send
 * JSON response. Else we redirect to an URL
 * which defined in `redirect` parameter.
 *
 * If req.flash contains errors, we send back error messages too.
 *
 * @param  {Object} req      request object
 * @param  {Object} res      response object
 * @param  {String} redirect redirect site URL.
 * @param  {Object} err      Error object.
 */
function respond(req, res, redirect, err) {
  if (req.accepts('json') && !req.accepts('html')) {
    let flash = req.flash()

    if (flash && flash.error && flash.error.length > 0) {
      let errMessage = flash.error[0].msg
      Response.json(res, null, err || Response.REQUEST_FAILED, errMessage)
    } else {
      let successData = 'OK'
      if (flash && flash.info && flash.info.length > 0) { successData = flash.info[0].msg }
      Response.json(res, successData)
    }
  } else if (redirect) {
    // Redirect to the original url
    if (req.session.returnTo) {
      redirect = req.session.returnTo
      delete req.session.returnTo
    }

    res.redirect(redirect)
  }
}
function loginWithPassword(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      console.error('error authenticating with passport:', err)
    }
    if (!user) {
      req.flash('error', {msg: info.message})
      return respond(req, res, '/login')
    }

    req.login(user, function (err) {
      if (err) {
        req.flash('error', {msg: err})
        return respond(req, res, '/login')
      }
      req.user.lastLogin = Date.now()
      req.user.save(function () {
        req.user.password = undefined
        req.user.salt = undefined
        respond(req, res, '/')
      })
    })
  })(req, res, next)
}
function loginWithoutPassword(req, res, next) {
  async.waterfall([

    function generateToken(done) {
      crypto.randomBytes(25, function (err, buf) {
        done(err, err ? null : buf.toString('hex'))
      })
    },

    function getUser(token, done) {
      let username = req.body.username
      User.findOne({
        $or: [
          {'username': username},
          {'email': username}
        ]
      }, function (err, user) {
        if (err) {
          console.log('error finding user by username', username, err)
        }
        if (!user) {
          req.flash('error', {msg: req.t('UsernameIsNotAssociated', {username: username})})
          return done('Invalid username or email: ' + username)
        }

        // Check that the user is not disabled or deleted
        if (user.status !== 1) {
          req.flash('error', {msg: req.t('UserDisabledOrDeleted')})
          return done(`User '${username} is disabled or deleted!`)
        }

        user.passwordLessToken = token
        // user.passwordLessTokenExpires = Date.now() + 3600000; // expire in 1 hour
        user.save(function (err) {
          done(err, token, user)
        })
      })
    },

    function sendResetEmailToUser(token, user, done) {
      let subject = req.t('mailSubjectLogin', config)

      res.render('mail/passwordLessLogin', {
        name: user.fullName,
        loginLink: 'http://' + req.headers.host + '/passwordless/' + token
      }, function (err, html) {
        if (err) { return done(err) }

        mailer.send(user.email, subject, html, function (err, info) {
          if (err) { req.flash('error', {msg: req.t('UnableToSendEmail', user)}) } else { req.flash('info', {msg: req.t('emailSentWithMagicLink', user)}) }

          done(err)
        })
      })
    }

  ], function (err, user) {
    if (err) {
      logger.error(err)
    }

    respond(req, res, 'back')
  })
}
module.exports = function (app) {
  let authRouter = express.Router()

  authRouter.post('/local', function (req, res, next) {
    req.assert('username', req.t('UsernameCannotBeEmpty')).notEmpty()

    let errors = req.validationErrors()
    if (errors) {
      req.flash('error', errors)
      return respond(req, res, '/login', Response.BAD_REQUEST)
    }

    if (req.body.password) {
      loginWithPassword(req, res, next)
    } else {
      loginWithoutPassword(req, res, next)
    }
  })

  /* // todo: let vue router handle GET requests

  authRouter.get('/google', passport.authenticate('google', {
    scope: 'profile email'
  }))
  authRouter.get('/github', passport.authenticate('github', {
    scope: 'user:email'
  }))

  */

  authRouter.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
  }), function (req, res) {
    res.redirect('/')
  })


  authRouter.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/login'
  }), function (req, res) {
    res.redirect('/')
  })

  // Add router to app
  app.use('/auth', authRouter)
}
