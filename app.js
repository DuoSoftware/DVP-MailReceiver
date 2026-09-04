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
server.use(bodyParser.json());

server.head('/DVP/API/:version/webhook/:webhookId', function (req, res, next) {
    res.end();
    return next();
});

server.post('/DVP/API/:version/webhook/:webhookId', function (req, res, next) {
    logger.info("DVP-MailReceiver: webhook body=%s", JSON.stringify(req.body));
    
    try {
        var mandrillEvents = req.body;
        logger.info("DVP-MailReceiver: mandrillEvents - %s", JSON.stringify(mandrillEvents));

        if (mandrillEvents[0].event === "inbound") {
            mandrillHandler.saveMail(req.params.webhookId, mandrillEvents[0]).then(function (result) {
                res.end(result);
            }).catch(function (err) {
                res.end(err)
            });
        }
    } catch (e) {
        logger.error("DVP-MailReceiver: failed to process webhook body=%s error=%s", JSON.stringify(req.body), e);
    }

    return next();
});


var port = config.Host.port || 3000;
server.listen(port, function () {
    logger.info("DVP-MailReceiver Server %s listening at %s", server.name, server.url);
});




