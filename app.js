/**
 * Created by a on 7/18/2016.
 */
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var restify = require('restify');
var mandrillHandler = require('./MandrillHandler');
if (config.Host.smtplistner)
    var smtpListner = require('./Workers/SMTPListner');
var mailHandler = require('./MailHandler');
var mongomodels = require('dvp-mongomodels');
var bodyParser = require('body-parser');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var ReplyMailer = require('./Workers/ReplyMailer');

mongomodels.connection.once('open', function () {
    logger.info("DVP-MailReceiver: Connected to MongoDB (%s:%s/%s)", config.Mongo.ip, config.Mongo.port, config.Mongo.dbname);
});

mongomodels.connection.on('error', function (err) {
    logger.error("DVP-MailReceiver: MongoDB connection error - %s", err);
});


var server = restify.createServer({
    name: 'DVP-MailReceiver'
});


server.use(restify.CORS());
server.use(restify.fullResponse());
server.pre(restify.pre.userAgentConnection());

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(bodyParser.urlencoded({extended: false, limit: '25mb'}));
server.use(bodyParser.json({limit: '25mb'}));

server.head('/DVP/API/:version/webhook/:webhookId', function (req, res, next) {
    res.end();
    return next();
});

server.post('/DVP/API/:version/webhook/:webhookId', function (req, res, next) {
    logger.info(
        "DVP-MailReceiver: webhook hit - webhookId=%s content-type=%s source=%s",
        req.params.webhookId,
        req.headers['content-type'],
        (req.body && typeof req.body.mandrill_events === 'string') ? 'body' :
            (req.headers['mandrill_events'] ? 'header' : 'none')
    );

    try {
        var mandrillEvents;

        if (req.body && typeof req.body.mandrill_events === 'string') {
            // Real Mandrill webhook: mandrill_events is a body field, already URL-decoded by bodyParser.
            mandrillEvents = JSON.parse(req.body.mandrill_events);
        } else if (req.headers['mandrill_events']) {
            // Fallback for test tools that send it as a header instead of a body field.
            // Header values are NOT auto-decoded, and may carry an accidental "mandrill_events=" prefix.
            var rawHeader = req.headers['mandrill_events'];
            var prefix = 'mandrill_events=';
            if (rawHeader.indexOf(prefix) === 0) {
                rawHeader = rawHeader.substring(prefix.length);
            }
            mandrillEvents = JSON.parse(decodeURIComponent(rawHeader));
        } else {
            mandrillEvents = req.body;
        }

        var event = mandrillEvents && mandrillEvents[0];

        // Mandrill can send many event types (send/open/click/bounce/spam/etc), not just inbound
        // mail - only treat it as mail to process into a ticket if it's really an inbound event
        // that actually carries mail details (a recipient address at minimum).
        var isInboundMail = !!(event && event.event === "inbound" && event.msg && event.msg.email);

        var originalMessageId;
        if (event && event.msg && event.msg.headers) {
            var headerKey = Object.keys(event.msg.headers).find(function (key) {
                return key.toLowerCase() === 'message-id';
            });
            originalMessageId = headerKey && event.msg.headers[headerKey];
        }
        logger.info("DVP-MailReceiver: original Message-Id - %s", originalMessageId);
        // Temporary - to confirm what Mandrill actually sends in msg.headers for a reply
        // (specifically In-Reply-To/References), so ticket threading can key off the right field.
        logger.info("DVP-MailReceiver: msg.headers - %s", event && event.msg && JSON.stringify(event.msg.headers));

        if (isInboundMail) {
            logger.info(
                "Incoming email received:\n  Email Subject: %s\n  From: %s\n  To: %s\n  Body: %s",
                event.msg.subject,
                event.msg.from_email,
                event.msg.email,
                event.msg.text
            );

            mandrillHandler.saveMail(req.params.webhookId, event).then(function (result) {
                res.end(result);
            }).catch(function (err) {
                res.end(err)
            });
        } else {
            logger.info("DVP-MailReceiver: webhook ignored - not an inbound mail event (event=%s)", event && event.event);
            res.end();
        }
    } catch (e) {
        logger.error("DVP-MailReceiver: failed to process webhook - %s", e);
        res.end();
    }

    return next();
});

// Lets the agent console send a reply on an existing mail thread - the console
// supplies who it's from/to and the original Message-Id so the reply threads
// under the sender's original email in their mail client.
server.post('/DVP/API/:version/Email/Reply', function (req, res, next) {
    var body = req.body || {};

    if (!body.from || !body.to) {
        var validationError = messageFormatter.FormatMessage(null, "from and to are required", false, undefined);
        logger.error(validationError);
        res.end(validationError);
        return next();
    }

    if (!body.messageId) {
        logger.info("DVP-MailReceiver: reply requested without a messageId - %s will be sent unthreaded", body.to);
    }

    ReplyMailer.sendReply({
        from: body.from,
        to: body.to,
        subject: body.subject,
        text: body.text,
        html: body.html,
        originalMessageId: body.messageId
    }, function (err, info) {
        if (err) {
            var errorResult = messageFormatter.FormatMessage(err, "Failed to send reply email", false, undefined);
            res.end(errorResult);
        } else {
            var successResult = messageFormatter.FormatMessage(null, "Reply email sent", true, undefined);
            res.end(successResult);
        }
    });

    return next();
});


var port = config.Host.port || 3000;
server.listen(port, function () {
    logger.info("DVP-MailReceiver Server %s listening at %s", server.name, server.url);
});




