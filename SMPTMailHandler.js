var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var Org = require('dvp-mongomodels/model/Organisation');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var Email = require('dvp-mongomodels/model/Email').Email;
var mailHandler = require('./MailHandler');


var saveMail = function (connection, data, content) {

    //logger.debug(data.toJSON());
    logger.debug("DVP-MailReceiver.SMPTMailHandler Internal method ");
    logger.debug(JSON.stringify(data));
    var jsonString;
    var receiver = data.to[0].address;
    var arr = receiver.split("@");

    logger.debug("Receiver - " + receiver);
    if (arr.length > 1) {

        var domain = arr[1];

        var arr1 = domain.split(".");

        var accountname = arr[0];
        logger.debug("Domain - " + domain);

        if (arr1.length > 2) {

            var companyName = arr1[0];

            logger.debug("Company - " + companyName);

            Org.findOne({companyName: companyName}, function (err, orgs) {
                if (err) {
                    jsonString = messageFormatter.FormatMessage(err, "Get Organisations Failed", false, undefined);
                    logger.error(jsonString);

                } else {
                    jsonString = messageFormatter.FormatMessage(err, "Get Organisations Successful", true, orgs);
                    logger.debug(jsonString);
                    if (orgs) {


                        data.created_at = Date.now();
                        data.company = orgs.id;
                        data.tenant = orgs.tenant;


                        Email.findOne({
                            company: orgs.id,
                            tenant: orgs.tenant,
                            name: accountname,
                            active: true
                        }, function (err, email) {
                            if (err) {

                                jsonString = messageFormatter.FormatMessage(err, "Get Twitter Failed", false, undefined);
                                logger.error(jsonString);

                            } else {
                                var SMPTMailObj = {
                                    "orgs": orgs,
                                    "email": email,
                                    "data": data
                                };
                                mailHandler.saveMail(SMPTMailObj);
                            }


                        });

                    }
                }

            });
        }
    }


};

module.exports.saveMail = saveMail;