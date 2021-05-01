const simpleParser = require('mailparser').simpleParser;


fs = require('fs')
fs.readFile('C:\\Users\\user\\Downloads\\s4vklhee489fqi275s963cdopkm6d917hluetk01', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    simpleParser(data, (err, mail) => {
        console.log(mail.text);
    })

});

