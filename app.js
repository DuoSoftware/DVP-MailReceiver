/**
 * Created by a on 7/18/2016.
 */
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var restify = require('restify');
var mandrillHandler = require('./MandrillHandler');
var genericMailProviderHandler = require('./GenericMailProviderHandler');
var ValidateWebhook = require('./ValidateWebhook');
var bodyParser = require('body-parser');
var mongomodels = require('dvp-mongomodels');


var server = restify.createServer({
    name: 'DVP-MailReceiver'
});


server.use(restify.CORS());
server.use(restify.fullResponse());
server.pre(restify.pre.userAgentConnection());

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
//server.use(restify.bodyParser());

server.head('/DVP/API/:version/webhook/:webhookId', ValidateWebhook.verifyRequestSignature, function (req, res, next) { // used to validate webhooks when Mandrill routes are added.
    res.end();
    return next();
});

server.post('/DVP/API/:version/webhook/:webhookId', bodyParser.urlencoded({
    type: function (req) {
        if (req.headers['content-type'] !== 'application/json') {
            req.headers['content-type'] = 'application/json';
        }
        return true;
    }
}), ValidateWebhook.verifyRequestSignature, function (req, res, next) {
    try {
        var mandrillEvents = JSON.parse(req.body.mandrill_events);

        if (mandrillEvents[0].event === "inbound") {
            mandrillHandler.saveMail(req.params.webhookId, mandrillEvents[0]).then(function (result) {
                res.end(result);
            }).catch(function (err) {
                res.end(err)
            });
        }
    } catch (e) {
        console.log(e)
    }

    return next();
});

server.post('/DVP/API/:version/webhook/genericmail/:domain', restify.bodyParser({ mapParams: false }), function (req, res, next) {
    try {
        var genericMailProviderEvents = req.body;

        if (genericMailProviderEvents.direction === "inbound") {
            genericMailProviderHandler.saveMail(req.params.domain, genericMailProviderEvents).then(function (result) {
                res.end(result);
            }).catch(function (err) {
                res.end(err)
            });
        } else {
            res.end(`Not an incoming message`);
        }
    } catch (e) {
        console.log(e);
        res.end();
    }

    return next();
});


var port = config.Host.port || 3000;
server.listen(port, function () {
    logger.info("DVP-MailReceiver Server %s listening at %s", server.name, server.url);
});