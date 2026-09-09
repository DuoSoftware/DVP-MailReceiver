var CreateComment = require('./Workers/common').CreateComment;
//require('./common').CreateComment;
var CreateCommentByReference = require('./Workers/common').CreateCommentByReference;
var CreateEngagement = require('./Workers/common').CreateEngagement;
var CreateTicketWithAttachments = require('./Workers/common').CreateTicketWithAttachments;

var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var EmailSession = require('dvp-mongomodels/model/MailSession').EmailSession;
var Attachment = require('dvp-mongomodels/model/Attachment').Attachment;
var Ticket = require('dvp-mongomodels/model/Ticket').Ticket;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var config = require('config');
var format = require('stringformat');
var async = require('async');
var MessageIdHelper = require('./Workers/MessageIdHelper');
var getOriginalMessageId = MessageIdHelper.getOriginalMessageId;
var getHeader = MessageIdHelper.getHeader;

// The Ticket schema's `attachments` field is [{type: ObjectId, ref: 'Attachment'}] -
// it needs real Attachment documents, not plain strings. Creates one per uploaded
// file and calls back with their _ids (skipping any that fail to save).
function createTicketAttachments(attachments, cb) {
    var uploaded = (attachments || []).filter(function (a) { return a.fileId; });
    if (uploaded.length === 0) {
        return cb([]);
    }

    async.map(uploaded, function (a, next) {
        var downloadUrl = format("/DVP/API/{0}/FileService/File/Download/{1}/{2}", config.Services.uploadurlVersion, a.fileId, encodeURIComponent(a.fileName));
        var attachmentDoc = Attachment({
            file: a.fileName,
            url: downloadUrl,
            type: a.contentType,
            size: a.length
        });
        attachmentDoc.save(function (err, saved) {
            if (err) {
                logger.error("DVP-MailReceiver: failed to save Attachment doc for %s - %s", a.fileName, err);
                return next(null, null);
            }
            next(null, saved._id);
        });
    }, function (err, results) {
        cb(results.filter(function (id) { return id; }));
    });
}

var saveMail = function (EmailObj) {


    var data = EmailObj.data;
    var orgs = EmailObj.orgs;
    var email = EmailObj.email;

    logger.debug("DVP-MailReceiver: MailHandler received - from=%s to=%s subject=%s", data.from && data.from[0] && data.from[0].address, data.to && data.to[0] && data.to[0].address, data.subject);
    var jsonString;

    var ticket_type = 'question';
    var ticket_tags = [];
    var ticket_priority = 'low';

    var ticket_custom_fields = [];
    var originalMessageId = getOriginalMessageId(data.headers);
    if (originalMessageId) {
        ticket_custom_fields.push({field: 'message_id', value: originalMessageId});
    }


    if (email) {

        if (email.ticket_type) {
            ticket_type = email.ticket_type;
        }

        if (email.ticket_tags) {
            ticket_tags = email.ticket_tags;
        }

        if (email.ticket_priority) {
            ticket_priority = email.ticket_priority;
        }
    }

    // Ticket.attachments is [{type: ObjectId, ref: 'Attachment'}] - real Attachment
    // documents need to be created first, then their _ids referenced on the ticket.
    createTicketAttachments(data.attachments, function (ticketAttachments) {

    data.direction = 'inbound';
    var emailsession = EmailSession(data);

    emailsession.save(function (err, engage) {
        if (err) {
            jsonString = messageFormatter.FormatMessage(err, "Email save failed", false, undefined);
            logger.error(jsonString);

        } else {

            logger.info("Email saved successfully ...");

            ////////////////////////create engagement and create a ticket////////////////////////////////////////////////
            //channel, company, tenant, from, to, direction, session, data, user,channel_id,contact,  cb
            CreateEngagement('email', orgs.id, orgs.tenant, data.from[0].address, data.to[0].address, 'inbound', data.messageId, data.text, function (isSuccess, result) {

                if (isSuccess) {
                    /////////////////////////////////////////////create ticket directly//////////////////////////
                    //CreateTicket("sms",sessionid,sessiondata["CompanyId"],sessiondata["TenantId"],smsData["type"], smsData["subject"], smsData["description"],smsData["priority"],smsData["tags"],function(success, result){});

                    // Falls back to the subject-parsing heuristic / new-ticket creation below -
                    // used both when there's no In-Reply-To header at all, and when there is
                    // one but it doesn't match any ticket we know about (e.g. a reply to an
                    // email this system didn't send).
                    var handleAsNewTicketOrSubjectComment = function () {

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

                                CreateTicketWithAttachments("email", data.messageId, result.profile, orgs.id, orgs.tenant, ticket_type, data.subject, data.text, ticket_priority, ticket_tags, ticketAttachments, ticket_custom_fields, function (done) {

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


                            CreateTicketWithAttachments("email", data.messageId, result.profile, orgs.id, orgs.tenant, ticket_type, data.subject, data.text, ticket_priority, ticket_tags, ticketAttachments, ticket_custom_fields, function (done) {

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

                    var inReplyToId = getHeader(data.headers, 'in-reply-to');
                    logger.info("DVP-MailReceiver: inReplyToId - %s", inReplyToId);

                    if (inReplyToId) {

                        Ticket.findOne({
                            company: orgs.id,
                            tenant: orgs.tenant,
                            custom_fields: {$elemMatch: {field: 'message_id', value: inReplyToId}}
                        }, function (err, foundTicket) {

                            if (err) {
                                logger.error("DVP-MailReceiver: ticket lookup by In-Reply-To %s failed - %s", inReplyToId, err);
                                handleAsNewTicketOrSubjectComment();

                            } else if (foundTicket && foundTicket.engagement_session) {

                                logger.debug("DVP-MailReceiver: In-Reply-To %s matched ticket %s - adding as a comment", inReplyToId, foundTicket.reference);

                                try {
                                    CreateComment('email', 'text', data.company, data.tenant, foundTicket.engagement_session, result, function (done) {
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

                                logger.debug("DVP-MailReceiver: no ticket found for In-Reply-To %s - creating a new ticket instead", inReplyToId);
                                handleAsNewTicketOrSubjectComment();
                            }
                        });

                    } else {
                        handleAsNewTicketOrSubjectComment();
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

    });

};


module.exports.saveMail = saveMail;