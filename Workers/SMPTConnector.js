/**
 * Created by a on 7/20/2016.
 */

var format = require("stringformat");
var config = require('config');
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var Template = require('../Model/Template').Template;
var dust = require('dustjs-linkedin');
var juice = require('juice');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var CreateEngagement = require('dvp-common/ServiceAccess/common').CreateEngagement;
var addressparser = require('addressparser');
var util = require('util');


var Org = require('dvp-mongomodels/model/Organisation');
var Email = require('dvp-mongomodels/model/Email').Email;

var nodemailer= require('nodemailer');

var smtpHost = {
    host: config.SMTP.ip,
    port: config.SMTP.port,
    pool: true,
    auth: {
        user: config.SMTP.user,
        pass: config.SMTP.password
    },
    tls:{

        rejectUnauthorized: false
    },
    logger: false
};

var transporter = nodemailer.createTransport(smtpHost);

function SendMail(mailOptions, message, cb){

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            logger.error('Message failed: ' + err.message);
            return cb(false, err.message);
        }
        logger.info('Message delivered: ' + info.response);

        var from = addressparser(mailOptions.from);
        var to = addressparser(mailOptions.to);

        if(util.isArray(to)){
            mailOptions.to = to[0].address;
        }

        if(util.isArray(from)){

            mailOptions.from = from[0].address;

        }

        if(mailOptions.engagement) {
            CreateEngagement('email', message.company, message.tenant, mailOptions.from, mailOptions.to, 'outbound', info.messageId, message.subject, function (done) {
                if (done) {
                    logger.debug("engagement created successfully");
                } else {

                    logger.error("engagement creation failed");
                }
            })
        }else{

            logger.debug("No engagement requested to be created");
        }

        return cb(true, info.messageId);

    });
}

// Builds and sends a reply email for the given message, threading it against
// message.inReplyTo (the Message-ID of the email/engagement being replied to)
// so mail clients group it into the existing conversation.
function SendReplyEmail(message, cb) {

    if(!message.from){

        message.from = "no-reply";
    }

    if (message === undefined || message.to === undefined || message.company === undefined || message.tenant === undefined) {
        logger.error('Invalid message, skipping');
        return cb(false, "Invalid message: 'to', 'company' and 'tenant' are required");
    }

    Org.findOne({tenant: message.tenant, id: message.company}, function(err, org) {
        if (err) {

            logger.error("Organization didn't found", err);
            return cb(false, "Organization lookup failed");

        }else{
            if(org) {

                var mailOptions = {
                    to: message.to,
                    subject: message.subject,
                    text: message.body,
                    html: message.body,
                    ticket: true,
                    engagement: message.engagement,
                    headers: {
                        "X-MC-Subaccount": "veery"
                    }
                };

                if(message.inReplyTo){

                    mailOptions.inReplyTo = message.inReplyTo;
                    mailOptions.references = message.references || message.inReplyTo;
                }

                var attachments = [];

                if(message.attachments && util.isArray(message.attachments)){

                    message.attachments.forEach(function(item){

                        if(item.url && item.name){

                            attachments.push({   // use URL as an attachment
                                filename: item.name,
                                path: item.url
                            });
                        }

                    });

                }

                if(util.isArray(attachments) && attachments.length > 0) {
                    mailOptions.attachments = attachments;
                }

                mailOptions.from= format("{0}@veery.cloud", message.from);

                mailOptions.replyTo = format("{0}@{1}.veery.cloud", message.from, org.companyName);

                if(message.template){
                    Template.findOne({name:message.template,company:message.company,tenant:message.tenant},function (errPickTemplate,resPickTemp) {


                        if(!errPickTemplate){

                            if(resPickTemp && resPickTemp.content &&resPickTemp.content.content){

                                var compileid = uuid.v4();

                                var compiled = dust.compile(resPickTemp.content.content, compileid);
                                dust.loadSource(compiled);
                                dust.render(compileid, message.Parameters, function(errRendered, outRendered) {
                                    if(errRendered)
                                    {
                                        logger.error("Error in rendering "+ errRendered);
                                        return cb(false, "Template rendering failed");
                                    }
                                    else {

                                        var renderedTemplate = "";
                                        var juiceOptions = {
                                            applyStyleTags: true
                                        }

                                        if (resPickTemp.styles.length > 0) {
                                            for (var i = 0; i < resPickTemp.styles.length; i++) {
                                                if (i == 0) {
                                                    renderedTemplate = outRendered;
                                                }

                                                logger.info("Rendering is success " + resPickTemp.styles[i].content);

                                                renderedTemplate = juice.inlineContent(renderedTemplate, resPickTemp.styles[i].content, juiceOptions);
                                                if (i == (resPickTemp.styles.length - 1)) {

                                                    if (resPickTemp.filetype.toLowerCase() == 'html') {
                                                        mailOptions.html = renderedTemplate;
                                                    } else {
                                                        mailOptions.text = renderedTemplate;
                                                    }
                                                }
                                            }
                                        }
                                        else {

                                            if (resPickTemp.filetype.toLowerCase() == 'html') {
                                                mailOptions.html = outRendered;
                                            } else {
                                                mailOptions.text = outRendered;
                                            }
                                        }

                                        if (resPickTemp.content.subject) {

                                            var compilesubid = uuid.v4();
                                            var compiledsub = dust.compile(resPickTemp.content.subject, compilesubid);
                                            dust.loadSource(compiledsub);
                                            dust.render(compilesubid, message.Parameters, function (errsubRendered, outsubRendered) {
                                                mailOptions.subject = outsubRendered;
                                                SendMail(mailOptions, message, cb);
                                            });

                                        } else {

                                            SendMail(mailOptions, message, cb);
                                        }
                                    }
                                });
                            }else{
                                logger.error("No template found");
                                return cb(false, "No template found");
                            }
                        }else{
                            logger.error("Pick template failed ",errPickTemplate);
                            return cb(false, "Template lookup failed");
                        }
                    });
                }else{
                    SendMail(mailOptions,message, cb);
                }
            }else{

                logger.error("No Organization found");
                return cb(false, "No Organization found");
            }
        }
    });
}

module.exports.SendReplyEmail = SendReplyEmail;


