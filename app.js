/**
 * Created by a on 7/18/2016.
 */
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var util = require('util');
var restify = require('restify');
var bodyParser = require('body-parser');
var Email = require('dvp-mongomodels/model/Email').Email;


if(config.Host.smtplistner)
    var smtpListner = require('./Workers/SMTPListner');
if(config.Host.smtpsender)
    var smtpconnector = require('./Workers/SMPTConnector');


if(config.Host.imaplistner)
    var imapListner = require('./Workers/IMAPLIstner');

var util = require('util');
var mongoip=config.Mongo.ip;
var mongoport=config.Mongo.port;
var mongodb=config.Mongo.dbname;
var mongouser=config.Mongo.user;
var mongopass = config.Mongo.password;
var mongoreplicaset= config.Mongo.replicaset;

var mongoose = require('mongoose');
var connectionstring = '';
if(util.isArray(mongoip)){

    mongoip.forEach(function(item){
        connectionstring += util.format('%s:%d,',item,mongoport)
    });

    connectionstring = connectionstring.substring(0, connectionstring.length - 1);
    connectionstring = util.format('mongodb://%s:%s@%s/%s',mongouser,mongopass,connectionstring,mongodb);

    if(mongoreplicaset){
        connectionstring = util.format('%s?replicaSet=%s',connectionstring,mongoreplicaset) ;
    }
}else{

    connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip,mongoport,mongodb)
}


mongoose.connect(connectionstring,{server:{auto_reconnect:true}});


mongoose.connection.on('error', function (err) {
    console.error( new Error(err));
    mongoose.disconnect();

});

mongoose.connection.on('opening', function() {
    console.log("reconnecting... %d", mongoose.connection.readyState);
});


mongoose.connection.on('disconnected', function() {
    console.error( new Error('Could not connect to database'));
    mongoose.connect(connectionstring,{server:{auto_reconnect:true}});
});

mongoose.connection.once('open', function() {
    console.log("Connected to db");

});


mongoose.connection.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});



process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
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

server.get("/health/live", function (req, res, next) {
    res.send(200, "live");
    return next();
});

// Sends a reply email threaded against an existing conversation.
// Body: { to, from, subject, body, company, tenant, inReplyTo, references, template, Parameters, attachments, engagement }
// inReplyTo must be the Message-ID of the email this is replying to, so the reply lands in the same thread.
server.post('/DVP/API/:version/Email/Reply', function (req, res, next) {

    if (!smtpconnector) {
        res.send(503, {IsSuccess: false, Message: "SMTP sender is disabled on this instance"});
        return next();
    }

    if (!req.body || !req.body.inReplyTo) {
        res.send(400, {IsSuccess: false, Message: "'inReplyTo' (Message-ID of the email being replied to) is required"});
        return next();
    }

    smtpconnector.SendReplyEmail(req.body, function (success, result) {
        if (success) {
            res.send(200, {IsSuccess: true, Result: result});
        } else {
            res.send(400, {IsSuccess: false, Message: result});
        }
        return next();
    });
});

var port = config.Host.port || 3000;
server.listen(port, function () {
    logger.info("DVP-MailReceiver Server %s listening at %s", server.name, server.url);
});













