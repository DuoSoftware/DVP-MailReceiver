var crypto = require('crypto');
var MandrillWebhook = require('dvp-mongomodels/model/MandrillWebhook').MandrillWebhook;


module.exports.verifyRequestSignature = function (req, res, buf, encoding) {
    var signature = req.headers["x-mandrill-signature"];

    if (!signature) {
        // For testing, let's log an error. In production, you should throw an
        // error.
        console.error("Couldn't validate the signature.");
        res.end(new Error("Couldn't validate the signature."));
    } else {

        MandrillWebhook.findOne({inbound_domain: req.params.webhookId}, function (err, webhook) {

            if (err) {
                res.end(err);
            } else {
                var signed_data = webhook.webhook_url;

                Object.keys(req.body)
                    .sort()
                    .forEach(function (v, i) {
                        signed_data += v;
                        signed_data += req.body[v];
                    });

                var expectedHash = crypto.createHmac('sha1', webhook.key).update(signed_data).digest('base64');

                if (signature !== expectedHash) {
                    console.error("Couldn't validate the request signature.");
                    res.end(new Error("Couldn't validate the request signature."));
                }


            }
        })
    }
};
