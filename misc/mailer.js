var mailer = require('nodemailer');
var config = require('../config/mailer');

const transport = mailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: config.MAILGUN_USER,
    pass: config.MAILGUN_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = {
    sendEmail(from, to, subject, html) {
      return new Promise((resolve, reject) => {
        transport.sendMail({from, subject, to , html}, (err, info) => {
          if (err) reject(err);

          resolve(info);
        });
      });
    }
}
