var MandrillWebhook = require('dvp-mongomodels/model/MandrillWebhook').MandrillWebhook;
var MailHandler = require('./MailHandler');
var Email = require('dvp-mongomodels/model/Email').Email;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var uuid = require('node-uuid');

var saveMail = function (webhookId, mailObj) {
    return new Promise(function (resolve, reject) {

        console.log(mailObj);
        var data = mailObj.msg;
        data.from = [];
        data.from[0] = {address: data.from_email, name: data.from_name};
        data.to = [];
        data.to[0] = {address: data.email, name: null};
        data.spamScore = data.spam_report.score;
        data.spf = data.spf.result;
        data.dkim = (data.dkim.valid) ? 'pass' : 'failed';
        data.messageId = uuid.v4();

        try {

            MandrillWebhook.findOne({inbound_domain: webhookId}, function (err, webhook) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "Get Mandrill webhook Failed", false, undefined);
                    logger.error(jsonString);
                    reject(jsonString)

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