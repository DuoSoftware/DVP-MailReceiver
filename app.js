/**
 * Created by a on 7/18/2016.
 */
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var util = require('util');
var restify = require('restify');
var mandrillHandler = require('./MandrillHandler');
if (config.Host.smtplistner)
    var smtpListner = require('./Workers/SMTPListner');
var mailHandler = require('./MailHandler');
var mongomodels = require('dvp-mongomodels');


var server = restify.createServer({
    name: 'DVP-MailReceiver'
});


server.use(restify.CORS());
server.use(restify.fullResponse());
server.pre(restify.pre.userAgentConnection());



server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.post('/DVP/API/:version/webhook/:webhookId', function (req, res, next) {
    var mandrillEvents = JSON.parse(req.params.mandrill_events);

    if (mandrillEvents[0].event === "inbound") {
        mandrillHandler.saveMail(req.params.webhookId, mandrillEvents[0]).then(function (result) {
            res.end(result);
        }).catch(function (err) {
            res.end(err)
        });
    }

    return next();
});


var port = config.Host.port || 3000;
server.listen(port, function () {
    logger.info("DVP-MailReceiver Server %s listening at %s", server.name, server.url);
});




