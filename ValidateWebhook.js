var crypto = require('crypto');
var MandrillWebhook = require('dvp-mongomodels/model/MandrillWebhook').MandrillWebhook;


module.exports.verifyRequestSignature = function (req, res, buf) {
    var signature = req.headers["X-Mandrill-Signature"];

    if (!signature) {
        // For testing, let's log an error. In production, you should throw an
        // error.
        console.error("Couldn't validate the signature.");
        res.end(new Error("Couldn't validate the signature."));
    } else {

        var signed_data = "http://676a73c0.ngrok.io/DVP/API/1.0.0.0/webhook/facetone.com";

        Object.keys(req.params)
            .sort()
            .forEach(function(v, i) {
                if(v==='mandrill_events') {
                    console.log(v, req.params[v]);
                    signed_data += v;
                    signed_data += req.params[v];
                }
            });
        console.log(signed_data);
        console.log(req.headers["x-mandrill-signature"]);

        var expectedHash = crypto.createHmac('sha1', "").update(signed_data).digest('base64');

    }
};
