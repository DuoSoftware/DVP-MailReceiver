var nodemailer = require('nodemailer');
var config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var transporter;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.SMTP.ip,
            port: config.SMTP.port,
            secure: false,
            auth: {
                user: config.SMTP.user,
                pass: config.SMTP.password
            }
        });
    }
    return transporter;
}

// Sends a reply back to the original sender on the same mail thread.
// In-Reply-To/References (set to the original Message-Id) are what make mail
// clients thread the reply under the sender's original email.
function sendReply(options, cb) {
    var subject = options.subject || '';
    if (!/^re:/i.test(subject)) {
        subject = 'Re: ' + subject;
    }

    var mailOptions = {
        from: options.from,
        to: options.to,
        subject: subject,
        text: options.text || 'Thank you for contacting us. We have received your email and will get back to you shortly.'
    };

    if (options.html) {
        mailOptions.html = options.html;
    }

    if (options.originalMessageId) {
        mailOptions.inReplyTo = options.originalMessageId;
        mailOptions.references = options.originalMessageId;
    }

    getTransporter().sendMail(mailOptions, function (err, info) {
        if (err) {
            logger.error("DVP-MailReceiver: failed to send reply to %s - %s", options.to, err);
        } else {
            logger.info("DVP-MailReceiver: reply sent to %s - %s", options.to, info && info.response);
        }
        if (cb) {
            cb(err, info);
        }
    });
}

module.exports.sendReply = sendReply;
// Kept as an alias - MandrillHandler's inbound auto-acknowledgement was written
// against this name and doesn't pass text/html, so it still gets the canned message.
module.exports.sendAutoReply = sendReply;
