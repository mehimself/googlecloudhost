const childProcess = require('child_process')
const path = require('path')

console.log('dir name', __dirname)

function onProcessOutput(data) {
  console.log('process output:', data.toString())
  return data
}

function onProcessError(data) {
  console.log('process stderr: ' + data)
  return data
}

function onProcessExit(exitCode) {
  console.log('process exited with code ' + exitCode)
}

function runPythonFile(filePath, onOutput, onError, onExit) { // i.e. /python/readOnce.py
  if (onExit === undefined) { onExit = onProcessExit() }
  if (onError === undefined) { onError = onProcessError() }
  if (onOutput === undefined) { onOutput = onProcessOutput() }
  let process = childProcess.spawn(
    'python',
    [
      path.join(__dirname, filePath)
    ]
  )
  process.stdout.on('data', onOutput)
  process.stderr.on('data', onError)
  process.on('close', onExit)
}
module.exports = runPythonFile
