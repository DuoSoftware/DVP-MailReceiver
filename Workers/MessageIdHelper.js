// Mandrill sends the original email's raw headers (Subject, Message-Id, In-Reply-To,
// etc.) as a plain object keyed however the sending client capitalized them - look
// headers up case-insensitively rather than assuming exact casing.
function getHeader(headers, name) {
    if (!headers) {
        return undefined;
    }
    var key = Object.keys(headers).find(function (k) {
        return k.toLowerCase() === name.toLowerCase();
    });
    return key && headers[key];
}

function getOriginalMessageId(headers) {
    return getHeader(headers, 'message-id');
}

module.exports.getHeader = getHeader;
module.exports.getOriginalMessageId = getOriginalMessageId;
