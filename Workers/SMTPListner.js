/**
 * Created by a on 7/18/2016.
 */
var mailin = require('mailin');
var SMPTMailHandler = require('../SMPTMailHandler');


mailin.start({
    port: 25,
    disableWebhook: true // Disable the webhook posting.
});


mailin.on('authorizeUser', function(connection, username, password, done) {
    if (username == "johnsmith" && password == "mysecret") {
        done(null, true);
    } else {
        done(new Error("Unauthorized!"), false);
    }
});


mailin.on('startMessage', function (connection) {

    console.log(connection);
});


mailin.on('message', SMPTMailHandler.saveMSMPail);












