const project = require('./project.config')
const path = require('path')

module.exports = {
  console: {
    level: 'info'
  },
  file: {
    enabled: false,
    path: path.join(path.normalize(path.join(__dirname, '..')), 'logs'),
    level: 'info',
    json: false,
    exceptionFile: true
  }

}
