const config = require('../../config/secrets/smtp')
const nodemailer = require('nodemailer')
const intervalDuration = 30000
const debug = {
  state: false
}
let queuedEmail = null
let reattemptInterval = null

function deliverUnsentEmail() {
  if (queuedEmail) {
    nodemailer.createTestAccount((err) => {
      if (err) {
        console.error('Failed to create a testing account. ' + err.message)
      } else {
        if (debug.state) console.log('Credentials obtained, sending message...')
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: config.smtp.auth
        })
        transporter.sendMail(queuedEmail, (err, info) => {
          if (err) {
            console.log('Error occurred sending email. ' + err.message)
          } else {
            if (queuedEmail.callback) queuedEmail.callback()
            queuedEmail = null
            clearInterval(reattemptInterval)
            if (debug.state) console.log('Message sent successfully')
          }
        })
      }
    })
  }
}

function send(address, subject, html, next) {
  let email = {
    to: address,
    subject: subject,
    text: html,
    callback: next
  }
  sendEmail(email)
}

function sendEmail(email) {
  email.from = config.from
  queuedEmail = email
  repeatUntilYouSucceed(deliverUnsentEmail)
}

function repeatUntilYouSucceed(attempt) {
  if (reattemptInterval !== null) {
    clearInterval(reattemptInterval)
  }
  attempt()
  reattemptInterval = setInterval(attempt, intervalDuration)
}

module.exports = send
module.exports = sendEmail
