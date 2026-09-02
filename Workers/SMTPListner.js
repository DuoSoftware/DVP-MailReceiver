/**
 * Created by a on 7/18/2016.
 */
var mailin = require('mailin');
var SMPTMailHandler = require('../SMPTMailHandler');


mailin.start({
    port: 2525,
    disableWebhook: true // Disable the webhook posting.
});


mailin.on('authorizeUser', function(connection, username, password, done) {
    if (username == "nipun@duosoftware.com" && password == "nipmax@123") {
        done(null, true);
    } else {
        done(new Error("Unauthorized!"), false);
    }
});


mailin.on('startMessage', function (connection) {

    console.log(connection);
});

mailin.on('message', (connection, data, content) => {
  console.log('Received email subject:', data.subject);
  console.log('Received email body:', data.text);
});


// mailin.on('message', SMPTMailHandler.saveMail);












