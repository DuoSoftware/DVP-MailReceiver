/**
 * Created by a on 7/18/2016.
 */
var mailin = require('mailin');
var AddToRequest = require('./Workers/common').AddToRequest;
var CreateComment = require('./Workers/common').CreateComment;
var CreateEngagement = require('./Workers/common').CreateEngagement;
var CreateTicket = require('./Workers/common').CreateTicket;
var RegisterCronJob = require('./Workers/common').RegisterCronJob;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var util = require('util');
var EmailSession = require('dvp-mongomodels/model/MailSession').EmailSession;
var Org = require('dvp-mongomodels/model/Organisation');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var Email = require('dvp-mongomodels/model/Email').Email;


if(config.Host.smtplistner)
    var smtpListner = require('./Workers/SMTPListner');
if(config.Host.smtpsender)
    var smtpconnector = require('./Workers/SMPTConnector');


var mongoip=config.Mongo.ip;
var mongoport=config.Mongo.port;
var mongodb=config.Mongo.dbname;
var mongouser=config.Mongo.user;
var mongopass = config.Mongo.password;



var mongoose = require('mongoose');
var connectionstring = util.format('mongodb://%s:%s@%s:%d/%s',mongouser,mongopass,mongoip,mongoport,mongodb)


mongoose.connection.on('error', function (err) {
    logger.error(err);
});

mongoose.connection.on('disconnected', function() {
    logger.error('Could not connect to database');
});

mongoose.connection.once('open', function() {
    logger.info("Connected to db");
});

mongoose.connect(connectionstring);













