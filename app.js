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



mailin.start({
    port: 25,
    disableWebhook: true // Disable the webhook posting.
});


mailin.on('authorizeUser', function(connection, username, password, done) {
    if (username == "johnsmith" && password == "mysecret") {
        done(null, true);
    } else {
        done(new Error("Unauthorized!"), false);
    }
});


mailin.on('startMessage', function (connection) {

    console.log(connection);
});


mailin.on('message', function (connection, data, content) {


    logger.debug(data.toJSON());
    logger.debug("DVP-SocialConnector.CreateTwitterAccount Internal method ");
    var jsonString;
    var receiver = data.to[0].address;
    var arr = receiver.split("@");

    logger.debug("Reciver - "+ receiver);
    if(arr.length > 1){

        var domain = arr[1];

        var arr1 = domain.split(".");

        logger.debug("Domain - "+ domain);

        if(arr1.length > 2){

            var companyName = arr1[0];

            logger.debug("Company - "+ companyName);

            Org.findOne({companyName: companyName}, function(err, orgs) {
                if (err) {
                    jsonString = messageFormatter.FormatMessage(err, "Get Organisations Failed", false, undefined);
                    logger.error(jsonString);
                }else{
                    jsonString = messageFormatter.FormatMessage(err, "Get Organisations Successful", true, orgs);
                    logger.debug(jsonString);
                    if(orgs){


                        data.created_at = Date.now();
                        data.company = orgs.company;
                        data.tenant = orgs.tenant;

                        var email = EmailSession(data);

                        email.save(function (err, engage) {
                            if (err) {
                                jsonString = messageFormatter.FormatMessage(err, "Email save failed", false, undefined);
                                logger.error(jsonString);

                            } else {

                                logger.info("Email saved successfully ...");

                            }
                        });

                    }
                }


            });
        }


    }

});