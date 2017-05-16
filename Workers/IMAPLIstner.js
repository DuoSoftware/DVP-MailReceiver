/**
 * Created by Sukitha on 11/8/2016.
 */
///////////////////////////////////////////////////////////////this is mainly for onsite implementation//////////////////////////////

var config = require('config');
var MailListener = require("mail-listener2");
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var Email = require('dvp-mongomodels/model/Email').Email;
var util = require('util');
var EmailSession = require('dvp-mongomodels/model/MailSession').EmailSession;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var CreateEngagement = require('dvp-common/ServiceAccess/common').CreateEngagement;
var CreateCommentWithAttachments = require('./common').CreateCommentWithAttachments;
var CreateCommentByReferenceWithAttachments = require('./common').CreateCommentByReferenceWithAttachments;
var CreateCommentByReferenceForUserWithAttachments = require('./common').CreateCommentByReferenceForUserWithAttachments;
var CreateTicketWithAttachments = require('./common').CreateTicketWithAttachments;
var UploadAttachments = require('./common').UploadAttachments;
var User = require('dvp-mongomodels/model/User');

var mailListener = new MailListener({

    username: config.IMAP.username,
    password: config.IMAP.password,
    host: config.IMAP.host,
    port: config.IMAP.port, // imap port
    tls: config.IMAP.secure, // use secure connection
    mailbox: config.IMAP.mailbox, // mailbox to monitor
    markSeen: config.IMAP.seen, // all fetched email willbe marked as seen and not fetched next time
    fetchUnreadOnStart: config.IMAP.fetch, // use it only if you want to get all unread email on lib start. Default is `false`

    //username: "imap-username",
    //password: "imap-password",
    //host: "imap-host",
    //port: 993, // imap port
    //tls: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    debug: console.log, // Or your custom function with only one incoming argument. Default: null
    tlsOptions: { rejectUnauthorized: false },
    //mailbox: "INBOX", // mailbox to monitor
    //searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
    //markSeen: true, // all fetched email willbe marked as seen and not fetched next time
    //fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
    mailParserOptions: {streamAttachments: false}, // options to be passed to mailParser lib.
    attachments: true, // download attachments as they are encountered to the project directory
    attachmentOptions: { directory: "/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function(){
    console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
    console.log("imapDisconnected");
});

mailListener.on("error", function(err){
    console.log(err);
});

mailListener.on("mail", function(mail, seqno, attributes){

    var company = config.IMAP.company;
    var tenant = config.IMAP.tenant;
    var jsonString;

    var ticket_type = 'question';
    var ticket_tags = [];
    var ticket_priority = 'low';


    Email.findOne({company: company, tenant: tenant}, function(err, email) {
        if (err) {

        } else {

            if (email) {

                mail.created_at = Date.now();
                mail.company = company;
                mail.tenant = tenant;

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


            var emailsession = EmailSession(mail);

            emailsession.save(function (err, engage) {
                if (err) {
                    jsonString = messageFormatter.FormatMessage(err, "Email save failed", false, undefined);
                    logger.error(jsonString);

                } else {


                    logger.info("Email saved successfully ...");

                    ////////////////////////create engagement and create a ticket////////////////////////////////////////////////


                    UploadAttachments(mail.messageId, mail.attachments, tenant, company, function (attach) {

                        console.log(attach);


                        var queryObject = {company: company, tenant: tenant};
                        queryObject["email.contact"] = mail.from[0].address;

                        //var otherQuery = {company: company, tenant: tenant, "contacts.type":"email" ,"contacts.contact": mail.from[0].address};
                        //var orQuery = {$or:[queryObject, otherQuery]};


                        User.findOne(queryObject).select("-password")
                            .exec(function (err, users) {
                                if (err) {

                                    // jsonString = messageFormatter.FormatMessage(err, "Get User Failed", false, undefined);

                                } else {

                                    if (users) {

                                        if (mail.subject) {

                                            var arr = mail.subject.split(/[\s:]+/);
                                            logger.debug("subject split " + arr);
                                            if (arr.length > 2 && arr[0] == 'Re') {

                                                logger.debug("comment");

                                                try {


                                                    //CreateCommentByReferenceForUser(channel, channeltype,company, tenant, ref, from, body, user, cb)
                                                    CreateCommentByReferenceForUserWithAttachments('email', 'text', mail.company, mail.tenant, arr[1], mail.from[0].address, mail.text, users, attach, function (done) {
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

                                                logger.error("Mail is not in correct format ");

                                            }
                                        } else {

                                            logger.error("No subject found ");

                                        }

                                    } else {
                                        //channel, company, tenant, from, to, direction, session, data, user,channel_id,contact,  cb

                                        CreateEngagement('email', company, tenant, mail.from[0].address, mail.to[0].address, 'inbound', mail.messageId, mail.text, undefined, undefined, undefined, function (isSuccess, result) {

                                            if (isSuccess) {
                                                /////////////////////////////////////////////create ticket directly//////////////////////////
                                                //CreateTicket("sms",sessionid,sessiondata["CompanyId"],sessiondata["TenantId"],smsData["type"], smsData["subject"], smsData["description"],smsData["priority"],smsData["tags"],function(success, result){});

                                                if (mail.inReplyTo && mail.inReplyTo.length > 0) {

                                                    try {
                                                        CreateCommentWithAttachments('email', 'text', mail.company, mail.tenant, mail.inReplyTo[0], result, attach, function (done) {
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

                                                    if (mail.subject) {

                                                        var arr = mail.subject.split(/[\s:]+/);
                                                        logger.debug("subject split " + arr);
                                                        if (arr.length > 2 && arr[0] == 'Re') {

                                                            logger.debug("comment");

                                                            try {
                                                                CreateCommentByReferenceWithAttachments('email', 'text', mail.company, mail.tenant, arr[1], result, attach, function (done) {
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

                                                            CreateTicketWithAttachments("email", mail.messageId, result.profile, company, tenant, ticket_type, mail.subject, mail.text, ticket_priority, ticket_tags, attach, function (done) {

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


                                                        CreateTicketWithAttachments("email", mail.messageId, result.profile, company, tenant, ticket_type, mail.subject, mail.text, ticket_priority, ticket_tags,attach, function (done) {

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
                                                jsonString = messageFormatter.FormatMessage(undefined, "No Twitter Found", false, undefined);
                                                logger.info(jsonString);
                                            }

                                        })

                                    }
                                }

                            });

                    });

                }
            });

        }
    });
    console.log("emailParsed", mail);

});

mailListener.on("attachment", function(attachment){
    console.log(attachment.path);
});

