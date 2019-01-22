const _ = require('lodash')
const async = require('async')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const passport = require('passport')
const User = require('./model')
const secrets = require('../../../config/secrets/secrets')
const smtpConfig = require('../../../config/secrets/smtp')
const admins = require('../../../config/secrets/auth').admins
const express = require('express')

module.exports = function (app) {
  let authRouter = express.Router()
  authRouter.get('/login', function (req, res) {
    'use strict'
    if (req.user) {
      return res.redirect('/')
    }
    res.render('account/login', {
      title: 'Login',
      csrfToken: req.csrfToken()
    })
  })
  authRouter.post('/login', function (req, res, next) {
    'use strict'
    req.assert('email', 'Email is not valid').isEmail()
    req.assert('password', 'Password cannot be blank').notEmpty()

    const errors = req.validationErrors()

    if (errors) {
      req.flash('errors', errors)
      return res.redirect('/login')
    }
    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err)
      }
      if (!user) {
        req.flash('errors', {msg: info.message})
        return res.redirect('/login')
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err)
        }
        req.flash('success', {msg: 'Success! You are logged in.'})
        res.redirect(req.session.returnTo || '/')
      })
    })(req, res, next)
  })
  authRouter.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
  })
  authRouter.get('/signup', function (req, res) {
    if (req.user) {
      return res.redirect('/')
    }
    res.render('account/signup', {
      title: 'Create Account',
      csrfToken: req.csrfToken()
    })
  })
  authRouter.post('/signup', function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail()
    req.assert('password', 'Password must be at least 4 characters long').len(4)
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

    const errors = req.validationErrors()

    if (errors) {
      req.flash('errors', errors)
      return res.redirect('/signup')
    }

    let user = new User({
      email: req.body.email,
      password: req.body.password,
      isAdmin: !!admins[req.body.email].isAdmin
    })

    User.findOne({email: req.body.email}, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {msg: 'Account with that email address already exists.'})
        return res.redirect('/signup')
      }
      user.isAdmin = admins[req.body.email] && !!admins[req.body.email].isAdmin
      user.save(function (err) {
        if (err) {
          return next(err)
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err)
          }
          res.redirect('/')
        })
      })
    })
  })
  authRouter.get('/account', function (req, res) {
    res.render('account/profile', {
      title: 'Account Management'
    })
  })
  authRouter.put('/profile', function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
      if (err) {
        return next(err)
      }
      user.email = req.body.email || ''
      user.profile.name = req.body.name || ''
      user.profile.gender = req.body.gender || ''
      user.profile.location = req.body.location || ''
      user.profile.website = req.body.website || ''

      user.save(function (err) {
        if (err) {
          return next(err)
        }
        req.flash('success', {msg: 'Profile information updated.'})
        res.redirect('/account')
      })
    })
  })
  authRouter.put('/password', function (req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4)
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

    const errors = req.validationErrors()

    if (errors) {
      req.flash('errors', errors)
      return res.redirect('/account')
    }

    User.findById(req.user.id, function (err, user) {
      if (err) {
        return next(err)
      }

      user.password = req.body.password

      user.save(function (err) {
        if (err) {
          return next(err)
        }
        req.flash('success', {msg: 'Password has been changed.'})
        res.redirect('/account')
      })
    })
  })
  authRouter.delete('/account', function (req, res, next) {
    User.remove({_id: req.user.id}, function (err) {
      if (err) {
        return next(err)
      }
      req.logout()
      req.flash('info', {msg: 'Your account has been deleted.'})
      res.redirect('/')
    })
  })
  authRouter.get('/oauthUnlink', function (req, res, next) {
    const provider = req.params.provider
    User.findById(req.user.id, function (err, user) {
      if (err) {
        return next(err)
      }

      user[provider] = undefined
      user.tokens = _.reject(user.tokens, function (token) { return token.kind === provider })

      user.save(function (err) {
        if (err) {
          return next(err)
        }
        req.flash('info', {msg: provider + ' account has been unlinked.'})
        res.redirect('/account')
      })
    })
  })
  authRouter.get('/reset', function (req, res) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    User
      .findOne({resetPasswordToken: req.params.token})
      .where('resetPasswordExpires').gt(Date.now())
      .exec(function (err, user) {
        if (!user) {
          req.flash('errors', {msg: 'Password reset token is invalid or has expired.'})
          return res.redirect('/forgot')
        }
        res.render('account/reset', {
          title: 'Password Reset',
          csrfToken: req.csrfToken()
        })
      })
  })
  authRouter.post('/reset', function (req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long.').len(4)
    req.assert('confirm', 'Passwords must match.').equals(req.body.password)

    const errors = req.validationErrors()

    if (errors) {
      req.flash('errors', errors)
      return res.redirect('back')
    }

    async.waterfall([
      function (done) {
        User
          .findOne({resetPasswordToken: req.params.token})
          .where('resetPasswordExpires').gt(Date.now())
          .exec((err, user) => {
            if (err) {
              console.log('find user by non-expired resetPasswordToken error', err)
            } else {
              if (!user) {
                req.flash('errors', {msg: 'Password reset token is invalid or has expired.'})
                return res.redirect('back')
              }

              user.password = req.body.password
              user.resetPasswordToken = undefined
              user.resetPasswordExpires = undefined

              user.save(function (err) {
                if (err) {
                  return next(err)
                }
                req.logIn(user, function (err) {
                  done(err, user)
                })
              })
            }
          })
      },
      function (user, done) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: smtpConfig.smtp..auth
        })
        const mailOptions = {
          to: user.email,
          from: smtpConfig.smtp.from,
          subject: 'Your CHCAA Host password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        }
        transporter.sendMail(mailOptions, function (err) {
          req.flash('success', {msg: 'Success! Your password has been changed.'})
          done(err)
        })
      }
    ], function (err) {
      if (err) {
        return next(err)
      }
      res.redirect('/')
    })
  })
  authRouter.get('/forgot', function (req, res) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    res.render('account/forgot', {
      title: 'Forgot Password',
      csrfToken: req.csrfToken()
    })
  })
  authRouter.post('/forgot', function (req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail()

    const errors = req.validationErrors()

    if (errors) {
      req.flash('errors', errors)
      return res.redirect('/forgot')
    }

    async.waterfall([
      function (done) {
        crypto.randomBytes(16, function (err, buf) {
          const token = buf.toString('hex')
          done(err, token)
        })
      },
      function (token, done) {
        User.findOne({email: req.body.email.toLowerCase()}, (err, user) => {
          if (err) {
            console.log('find user by email error', err)
          } else {
            if (!user) {
              req.flash('errors', {msg: 'No account with that email address exists.'})
              return res.redirect('/forgot')
            }

            user.resetPasswordToken = token
            user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

            user.save((err) => {
              done(err, token, user)
            })
          }
        })
      },
      function (token, user, done) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: smtpConfig.smtp.auth
        })
        const mailOptions = {
          to: user.email,
          from: smtpConfig.smtp.from,
          subject: 'Reset your password on CHCAA Host',
          text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }
        transporter.sendMail(mailOptions, function (err) {
          req.flash('info', {msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.'})
          done(err, 'done')
        })
      }
    ], function (err) {
      if (err) {
        return next(err)
      }
      res.redirect('/forgot')
    })
  })

  app.use('/auth', authRouter)
}
