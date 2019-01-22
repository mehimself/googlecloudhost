const path = require('path')
const express = require('express')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const compress = require('compression')
const favicon = require('serve-favicon')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('express-flash')
const passport = require('passport')
const expressValidator = require('express-validator')
const history = require('connect-history-api-fallback')
const cors = require('cors')
const helmet = require('helmet')
const crossdomain = require('helmet-crossdomain')
const helpers = require('../config/helpers')
const ssl = require('./SSLCertificateValidation')

const debug = require('debug')('app:server')

const config = require('../config/project.config')
const {__DEV__, __PROD__, __TEST__} = config.globals

/**
 * Controllers (route handlers).
 */
const auth = require('./authentication')
const api = require('./api')

/**
 * API keys and Passport configuration.
 */
const databaseURI = require('../config/secrets/database').uri
const secrets = require('../config/secrets/secrets') // todo: refresh oauth and store secrets here

const db = require('./database') // initialize database
const app = express()

app.use(compress())
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressValidator())
app.use(function insertCSPHeader(req, res, next) {
  res.setHeader('Content-Security-Policy', 'font-src \'self\' data:;')
  return next()
})
app.use(methodOverride())
app.use(cookieParser())
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({url: databaseURI, autoReconnect: true})
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(history())
app.use(cors())
app.use(helmet.xssFilter())
app.use(helmet.noSniff())
app.use(helmet.frameguard())
app.use(helmet.ieNoOpen())
app.use(helmet.hidePoweredBy())
app.use(crossdomain())

app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})
app.use(function (req, res, next) {
  if (/api/i.test(req.path)) {
    req.session.returnTo = req.path
  }
  next()
})

/*
    application modules
 */

app.use('/.well-known/acme-challenge', ssl) // todo: finish free https certificate process
app.use('/auth', auth)
app.use('/api', api)

if (__DEV__) {
  debug('Enabling webpack dev and HMR middleware')

  const Webpack = require('webpack')
  const webpackConfig = require('../webpack.config')
  const compiler = Webpack(webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: helpers('src'),
    hot: true,
    inline: true,
    quiet: false,
    noInfo: false,
    lazy: false,
    stats: {
      chunks: false,
      chunkModules: false,
      colors: true
    }
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr'
  }))

  app.use(express.static(helpers('public')))
  app.use(express.static(compiler.outputPath))
} else if (__PROD__) {
  debug('Prod environment server running.')
  app.use(express.static(config.outDir, {maxAge: '365d'}))
} else if (__TEST__) {
  debug('The test environment is under development.')
}

module.exports = app
