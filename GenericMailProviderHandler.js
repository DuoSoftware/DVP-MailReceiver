var EmailProviderLookup = require('dvp-mongomodels/model/EmailProviderLookup').EmailProviderLookup;
var MailHandler = require('./MailHandler');
var Email = require('dvp-mongomodels/model/Email').Email;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var uuid = require('node-uuid');

var saveMail = function (domain, data) {
    return new Promise(function (resolve, reject) {

        console.log(data);
        data.messageId = uuid.v4();

        try {

            EmailProviderLookup.findOne({inbound_domain: domain}, function (err, webhook) {
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

                        var accountname = arr[0];

                        logger.debug("Domain - " + domain);
                        logger.debug("Company - " + webhook.company);

                        data.created_at = Date.now();
                        data.company = orgs.id;
                        data.tenant = orgs.tenant;

                        Email.findOne({
                            company: orgs.id,
                            tenant: orgs.tenant,
                            name: accountname,
                            domain: domain,
                            active: true
                        }, function (err, email) {
                            if (err) {

                                var jsonString = messageFormatter.FormatMessage(err, "Get Email config Failed", false, undefined);
                                logger.error(jsonString);
                                reject(jsonString);

                            } else {
                                var SMPTMailObj = {
                                    "orgs": orgs,
                                    "email": email,
                                    "data": data
                                };
                                MailHandler.saveMail(SMPTMailObj);
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