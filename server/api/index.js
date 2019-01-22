const express = require('express')
const router = express.Router()
const pythonService = require('./services/runPython')

// const WebsocketManager = require('../WebSocketService')
// const ws = new WebsocketManager()

router.use('/python', pythonService)

module.exports = router
