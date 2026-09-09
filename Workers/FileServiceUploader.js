var request = require('request');
var config = require('config');
var format = require('stringformat');
var validator = require('validator');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

// Uploads a single decoded attachment buffer to the platform file service and
// returns (via cb(err, url)) the accessible URL for that file.
function uploadAttachment(buffer, filename, contentType, cb) {

    if (!(config.Services && config.Services.uploadurl && config.Services.uploadurlVersion)) {
        return cb(new Error('File service is not configured (config.Services.uploadurl/uploadurlVersion)'));
    }

    // Matches the convention used throughout Workers/common.js: only append the port
    // when the host is a raw IP - a real hostname is assumed to be behind a proxy on
    // the standard port already.
    var uploadURL = format("http://{0}/DVP/API/{1}/FileService/File/Upload", config.Services.uploadurl, config.Services.uploadurlVersion);
    if (validator.isIP(config.Services.uploadurl) && config.Services.uploadport) {
        uploadURL = format("http://{0}:{1}/DVP/API/{2}/FileService/File/Upload", config.Services.uploadurl, config.Services.uploadport, config.Services.uploadurlVersion);
    }

    request.post({
        url: uploadURL,
        headers: {
            authorization: "Bearer " + config.Services.accessToken
        },
        formData: {
            files: {
                value: buffer,
                options: {
                    filename: filename,
                    contentType: contentType
                }
            },
            fileCategory: 'CHAT_ATTACHMENTS'
        }
    }, function (err, response, body) {

        if (err) {
            logger.error("DVP-MailReceiver: file service upload failed for %s - %s", filename, err);
            return cb(err);
        }

        logger.info("DVP-MailReceiver: file service response for %s - status=%s body=%s", filename, response && response.statusCode, body);

        if (!response || response.statusCode < 200 || response.statusCode >= 300) {
            return cb(new Error("File service returned status " + (response && response.statusCode)));
        }

        var url;
        try {
            var parsed = (typeof body === 'string') ? JSON.parse(body) : body;
            // Best-effort extraction across a few common response shapes - once the
            // real response is seen in the log above, trim this to the exact one.
            if (parsed) {
                if (parsed.ReturnedObject && parsed.ReturnedObject[0] && parsed.ReturnedObject[0].url) {
                    url = parsed.ReturnedObject[0].url;
                } else if (Array.isArray(parsed) && parsed[0] && parsed[0].url) {
                    url = parsed[0].url;
                } else if (parsed.data && parsed.data[0] && parsed.data[0].url) {
                    url = parsed.data[0].url;
                } else if (parsed.url) {
                    url = parsed.url;
                }
            }
        } catch (parseErr) {
            logger.error("DVP-MailReceiver: could not parse file service response for %s - %s", filename, parseErr);
        }

        if (!url) {
            logger.error("DVP-MailReceiver: file service upload for %s succeeded but no url could be extracted - check the logged response above", filename);
        }

        return cb(null, url);
    });
}

module.exports.uploadAttachment = uploadAttachment;
