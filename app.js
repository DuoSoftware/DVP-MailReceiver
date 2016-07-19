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

    var ticket_type = 'question';
    var ticket_tags = [];
    var ticket_priority = 'low';





    logger.debug("Reciver - "+ receiver);
    if(arr.length > 1){

        var domain = arr[1];

        var arr1 = domain.split(".");

        var accountname = arr[0];
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
                        data.company = orgs.id;
                        data.tenant = orgs.tenant;



                        Email.findOne({company: company, tenant: tenant, name: accountname}, function(err, email) {
                            if (err) {

                                jsonString = messageFormatter.FormatMessage(err, "Get Twitter Failed", false, undefined);
                                res.end(jsonString);

                            } else {

                                if (email) {

                                    if (email.ticket_type) {
                                        ticket_type = ticket_type;
                                    }

                                    if (email.ticket_tags) {
                                        ticket_tags = ticket_tags;
                                    }

                                    if (email.ticket_priority) {
                                        ticket_priority = ticket_priority;
                                    }
                                }


                                var email = EmailSession(data);

                                email.save(function (err, engage) {
                                    if (err) {
                                        jsonString = messageFormatter.FormatMessage(err, "Email save failed", false, undefined);
                                        logger.error(jsonString);

                                    } else {

                                        logger.info("Email saved successfully ...");

                                        ////////////////////////create engagement and create a ticket////////////////////////////////////////////////
                                        CreateEngagement('email', orgs.id,  orgs.tenant, data.from[0].address, data.to[0].address, 'inbound', data. messageId,  data.text,function(isSuccess, result){




                                            if (isSuccess) {


                                                /////////////////////////////////////////////create ticket directly//////////////////////////
                                                //CreateTicket("sms",sessionid,sessiondata["CompanyId"],sessiondata["TenantId"],smsData["type"], smsData["subject"], smsData["description"],smsData["priority"],smsData["tags"],function(success, result){});

                                                CreateTicket("twitter", data. messageId,result.profile,company, tenant, ticket_type, data.subject,data.text, ticket_priority,ticket_tags, function (done) {

                                                    if (done) {


                                                        logger.info("Add Request completed ");

                                                        jsonString = messageFormatter.FormatMessage(undefined, "Add Request completed", true, undefined);
                                                        logger.info(jsonString);


                                                    } else {

                                                        logger.error("Add Request failed " + item.id);
                                                        jsonString = messageFormatter.FormatMessage(undefined, "No Twitter Found", false, undefined);
                                                        logger.info(jsonString);
                                                    }

                                                });


                                                //////////////////////////////////////first check in comments and update them////////////////////////////////////////////////////////////////

                                            } else {

                                                logger.error("Create engagement failed " + item.id);
                                                jsonString = messageFormatter.FormatMessage(undefined, "No Twitter Found", false, undefined);
                                                logger.info(jsonString);
                                            }




                                        })



                                    }
                                });
                            }
                        });

                    }
                }

            });
        }


    }

});