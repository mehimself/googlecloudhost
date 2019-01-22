const express = require('express')
const router = express.Router()
const SSLCredentials = require('./../../config/secrets/datakubenSSLCertificate') // todo: get a new one

router.get(SSLCredentials.appId, function (req, res) {
  console.log('handling ACME SSL challenge')
  res.send(SSLCredentials.certificate)
})

module.exports = router
