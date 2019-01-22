let Hashids = require('hashids')
let config = require('../../config/secrets/auth')

module.exports = function (module, length) {
  return new Hashids(module + config.hashSecret, length || 10)
}
