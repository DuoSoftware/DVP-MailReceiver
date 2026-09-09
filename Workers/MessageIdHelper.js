// Mandrill sends the original email's raw headers (Subject, Message-Id, etc.) as
// a plain object keyed however the sending client capitalized them - look the
// Message-Id up case-insensitively rather than assuming exact casing.
function getOriginalMessageId(headers) {
    if (!headers) {
        return undefined;
    }
    var key = Object.keys(headers).find(function (k) {
        return k.toLowerCase() === 'message-id';
    });
    return key && headers[key];
}

module.exports.getOriginalMessageId = getOriginalMessageId;
