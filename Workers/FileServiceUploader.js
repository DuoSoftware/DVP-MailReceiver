var request = require('request');
var config = require('config');
var format = require('stringformat');
var validator = require('validator');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

// Uploads a single decoded attachment buffer to the platform file service and
// returns (via cb(err, url)) the accessible URL for that file. tenant/company
// identify which org the file belongs to - same companyinfo convention used by
// CreateComment/CreateTicket in Workers/common.js.
function uploadAttachment(buffer, filename, contentType, tenant, company, cb) {

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
            authorization: "Bearer " + config.Services.accessToken,
            companyinfo: format("{0}:{1}", tenant, company)
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

        var fileId;
        try {
            var parsed = (typeof body === 'string') ? JSON.parse(body) : body;
            // Real shape (confirmed): {Exception, CustomMessage, IsSuccess, Result: "<file id>"}
            if (parsed && parsed.IsSuccess && parsed.Result) {
                fileId = parsed.Result;
            } else if (parsed) {
                // Fallback guesses, kept in case another environment returns a different shape.
                if (parsed.ReturnedObject && parsed.ReturnedObject[0] && parsed.ReturnedObject[0].id) {
                    fileId = parsed.ReturnedObject[0].id;
                } else if (Array.isArray(parsed) && parsed[0] && parsed[0].id) {
                    fileId = parsed[0].id;
                } else if (parsed.data && parsed.data[0] && parsed.data[0].id) {
                    fileId = parsed.data[0].id;
                } else if (parsed.id) {
                    fileId = parsed.id;
                }
            }
        } catch (parseErr) {
            logger.error("DVP-MailReceiver: could not parse file service response for %s - %s", filename, parseErr);
        }

        if (!fileId) {
            logger.error("DVP-MailReceiver: file service upload for %s succeeded but no file id could be extracted - check the logged response above", filename);
            return cb(null, undefined);
        }

        var downloadUrl = buildDownloadUrl(fileId, filename);

        // Fetch it back straight away, as a sanity check that the file is actually
        // retrievable with the same Bearer token - regardless of the outcome, the
        // url itself is still handed back since the ticket/UI side will fetch it later.
        request.get({
            url: downloadUrl,
            headers: {
                authorization: "Bearer " + config.Services.accessToken
            },
            encoding: null
        }, function (getErr, getResponse, fileBody) {
            if (getErr) {
                logger.error("DVP-MailReceiver: could not fetch back %s for verification - %s | url=%s", filename, getErr, downloadUrl);
            } else if (!getResponse || getResponse.statusCode < 200 || getResponse.statusCode >= 300) {
                logger.error("DVP-MailReceiver: download check for %s returned status %s | url=%s", filename, getResponse && getResponse.statusCode, downloadUrl);
            } else {
                logger.info("DVP-MailReceiver: fetched %s successfully (%d bytes) - url=%s", filename, fileBody ? fileBody.length : 0, downloadUrl);
            }

            return cb(null, downloadUrl);
        });
    });
}

// Builds an accessible download link for a previously uploaded file.
// GET <host>/DVP/API/<version>/FileService/File/Download/:id/:displayname - requires
// the same Bearer token as the upload call when actually fetched.
function buildDownloadUrl(fileId, displayName) {
    return format(
        "https://{0}/DVP/API/{1}/FileService/File/Download/{2}/{3}",
        config.Services.uploadurl,
        config.Services.uploadurlVersion,
        fileId,
        encodeURIComponent(displayName)
    );
}

module.exports.uploadAttachment = uploadAttachment;
module.exports.buildDownloadUrl = buildDownloadUrl;
