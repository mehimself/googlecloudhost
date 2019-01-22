const express = require('express')
const runPythonFile = require('./runPythonScript')
const path = require('path')
const fs = require('fs')

const router = express.Router()
const scriptPath = path.join(__dirname, '/scripts')


function listPythonFiles(path) {
  let scriptNames = []

  let items = fs.readdirSync(path)
  for (let i = 0; i < items.length; i++) {
    const isPythonFile = items[i].match(/\.py$/)
    if (isPythonFile) {
      scriptNames.push(items[i])
    }
  }
  return scriptNames
}

router.get('/', function (req, res) {
  res.send(listPythonFiles(scriptPath))
})

router.get('/:filename', async function (req, res) {
  function onProcessOutput(data) {
    console.log('onData', data.toString())
    log += data.toString() + '\n'
  }
  function onProcessError(err) {
    log += 'ERROR:' + err + '\n'
    res.status(500)
    res.send(log)
  }
  function onProcessExit(exitCode) {
    log += 'process exited with code ' + exitCode
    res.send(log)
  }
  let log = ''
  const filePath = path.join('/scripts/', req.params.filename)
  runPythonFile(filePath, onProcessOutput, onProcessError, onProcessExit)
})

module.exports = router
