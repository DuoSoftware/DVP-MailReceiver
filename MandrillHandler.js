var MandrillWebhook = require('dvp-mongomodels/model/MandrillWebhook').MandrillWebhook;
var MailHandler = require('./MailHandler');
var Email = require('dvp-mongomodels/model/Email').Email;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var uuid = require('node-uuid');
var async = require('async');
var FileServiceUploader = require('./Workers/FileServiceUploader');

// Uploads every decoded attachment to the file service and stamps `fileId`
// onto each one (the file service's own id, used for the ticket's slot_attachment).
// Always calls back with the (possibly partially-uploaded) array - a single
// failed upload doesn't block the rest of the email from being processed.
function uploadAttachments(attachments, orgs, cb) {
    if (!attachments || attachments.length === 0) {
        return cb(attachments);
    }

    async.map(attachments, function (att, next) {
        FileServiceUploader.uploadAttachment(att.content, att.fileName, att.contentType, orgs.tenant, orgs.id, function (err, uploaded) {
            if (err) {
                logger.error("DVP-MailReceiver: failed to upload attachment %s to file service - %s", att.fileName, err);
            } else if (uploaded && uploaded.id) {
                att.fileId = uploaded.id;
            }
            next(null, att);
        });
    }, function (err, results) {
        cb(results);
    });
}

var saveMail = function (webhookId, mailObj) {
    return new Promise(function (resolve, reject) {

        var data = mailObj.msg;
        data.from = [];
        data.from[0] = {address: data.from_email, name: data.from_name};
        data.to = [];
        data.to[0] = {address: data.email, name: null};
        data.spamScore = data.spam_report.score;
        data.spf = data.spf.result;
        data.dkim = (data.dkim.valid) ? 'pass' : 'failed';
        data.messageId = uuid.v4();

        // Mandrill sends attachments as a hash keyed by id: {name, type, content, base64}.
        // The EmailSession schema expects an array of {fileName, contentType, content (Buffer), length}.
        var rawAttachments = data.attachments;
        data.attachments = [];
        if (rawAttachments) {
            Object.keys(rawAttachments).forEach(function (key) {
                var att = rawAttachments[key];
                if (!att || !att.content) {
                    return;
                }
                var buffer = att.base64 ? Buffer.from(att.content, 'base64') : Buffer.from(att.content, 'utf8');
                data.attachments.push({
                    fileName: att.name,
                    contentType: att.type,
                    content: buffer,
                    length: buffer.length
                });
            });
        }

        if (data.attachments.length > 0) {
            logger.info("DVP-MailReceiver: %d attachment(s) received - %s", data.attachments.length, data.attachments.map(function (a) {
                return a.fileName + " (" + a.contentType + ", " + a.length + " bytes)";
            }).join(", "));
        }

        try {

            MandrillWebhook.findOne({inbound_domain: webhookId}, function (err, webhook) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "Get Mandrill webhook Failed", false, undefined);
                    logger.error(jsonString);
                    reject(jsonString)

                } else if (!webhook) {
                    var jsonString = messageFormatter.FormatMessage(null, "No webhook registered for domain " + webhookId, false, undefined);
                    logger.error(jsonString);
                    reject(jsonString);

                } else {
                    var receiver = data.email;
                    var orgs = {
                        id: webhook.company,
                        tenant: webhook.tenant
                    };
                    var arr = receiver.split("@"); //

                    logger.debug("Receiver - " + receiver);
                    if (arr.length > 1) { //

                        var domain = webhook.inbound_domain;

                        var accountname = arr[0];

                        logger.debug("Domain - " + domain);
                        logger.debug("Company - " + webhook.company);

                        data.created_at = Date.now();
                        data.company = orgs.id;
                        data.tenant = orgs.tenant;

                        // Upload attachments now that we know which company/tenant they belong to.
                        uploadAttachments(data.attachments, orgs, function (attachmentsWithIds) {
                            data.attachments = attachmentsWithIds;

                            var uploaded = attachmentsWithIds.filter(function (a) { return a.fileId; });
                            if (uploaded.length > 0) {
                                logger.info("DVP-MailReceiver: uploaded file id(s) - %s", uploaded.map(function (a) {
                                    return a.fileName + ": " + a.fileId;
                                }).join(", "));
                            }

                            Email.findOne({
                                company: orgs.id,
                                tenant: orgs.tenant,
                                name: arr[0],
                                domain: domain,
                                active: true
                            }, function (err, email) {
                                if (err) {

                                    var jsonString = messageFormatter.FormatMessage(err, "Get Email config Failed", false, undefined);
                                    logger.error(jsonString);
                                    reject(jsonString);

                                } else {
                                    var MailObj = {
                                        "orgs": orgs,
                                        "email": email,
                                        "data": data
                                    };
                                    MailHandler.saveMail(MailObj);
                                    var jsonString = messageFormatter.FormatMessage(null, "Email successfully handled", true, undefined);
                                    logger.info(jsonString);
                                    resolve(jsonString);
                                }


                            });
                        });


                    } else {
                        var jsonString = messageFormatter.FormatMessage(null, "Invalid recipient address " + receiver, false, undefined);
                        logger.error(jsonString);
                        reject(jsonString);
                    }

                }
            })
        } catch (e) {
            console.log(e);
            reject(e);
        }

    })
};


module.exports.saveMail = saveMail;