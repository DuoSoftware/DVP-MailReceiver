var CreateComment = require('dvp-common/ServiceAccess/common').CreateComment;
//require('./common').CreateComment;
var CreateCommentByReference = require('./Workers/common').CreateCommentByReference;
var CreateEngagement = require('dvp-common/ServiceAccess/common').CreateEngagement;
var CreateTicket = require('dvp-common/ServiceAccess/common').CreateTicket;

var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var EmailSession = require('dvp-mongomodels/model/MailSession').EmailSession;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');

var saveMail = function (EmailObj) {


    var data = EmailObj.data;
    var orgs = EmailObj.orgs;
    var email = EmailObj.email;

    logger.debug(JSON.stringify(data));
    var jsonString;

    var ticket_type = 'question';
    var ticket_tags = [];
    var ticket_priority = 'low';


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


    var emailsession = EmailSession(data);

    emailsession.save(function (err, engage) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Email save failed", false, undefined);
            logger.error(jsonString);

        } else {

            logger.info("Email saved successfully ...");

            ////////////////////////create engagement and create a ticket////////////////////////////////////////////////
            //channel, company, tenant, from, to, direction, session, data, user,channel_id,contact,  cb
            CreateEngagement('email', orgs.id, orgs.tenant, data.from[0].address, data.to[0].address, 'inbound', data.messageId, data.text, undefined, undefined, undefined, function (isSuccess, result) {

                if (isSuccess) {
                    /////////////////////////////////////////////create ticket directly//////////////////////////
                    //CreateTicket("sms",sessionid,sessiondata["CompanyId"],sessiondata["TenantId"],smsData["type"], smsData["subject"], smsData["description"],smsData["priority"],smsData["tags"],function(success, result){});

                    if (data.inReplyTo && data.inReplyTo.length > 0) {

                        try {
                            CreateComment('email', 'text', data.company, data.tenant, data.inReplyTo[0], result, function (done) {
                                if (done) {
                                    logger.debug("comment created successfully");

                                } else {
                                    logger.error("comment creation failed");
                                }
                            });
                        } catch (ex) {
                            logger.error("Error in comment ", ex);
                        }
                    } else {

                        if (data.subject) {

                            var arr = data.subject.split(/[\s:]+/);
                            logger.debug("subject split " + arr);
                            if (arr.length > 2 && arr[0] == 'Re') {

                                logger.debug("comment");

                                try {
                                    CreateCommentByReference('email', 'text', data.company, data.tenant, arr[1], result, function (done) {
                                        if (done) {
                                            logger.debug("comment created successfully");

                                        } else {
                                            logger.error("comment creation failed");
                                        }
                                    });
                                } catch (ex) {
                                    logger.error("Error in comment ", ex);
                                }

                            } else {

                                CreateTicket("email", data.messageId, result.profile, orgs.id, orgs.tenant, ticket_type, data.subject, data.text, ticket_priority, ticket_tags, function (done) {

                                    if (done) {

                                        logger.info("Add Request completed ");
                                        jsonString = messageFormatter.FormatMessage(undefined, "Add Request completed", true, undefined);
                                        logger.info(jsonString);


                                    } else {

                                        logger.error("Add Request failed ");
                                        jsonString = messageFormatter.FormatMessage(undefined, "No Twitter Found", false, undefined);
                                        logger.info(jsonString);
                                    }

                                });

                            }
                        } else {


                            CreateTicket("email", data.messageId, result.profile, orgs.id, orgs.tenant, ticket_type, data.subject, data.text, ticket_priority, ticket_tags, function (done) {

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

                        }
                    }

                    //////////////////////////////////////first check in comments and update them////////////////////////////////////////////////////////////////

                } else {

                    logger.error("Create engagement failed ");
                    jsonString = messageFormatter.FormatMessage(undefined, "Create engagement failed", false, undefined);
                    logger.info(jsonString);
                }

            })
        }
    });

};


module.exports.saveMail = saveMail;