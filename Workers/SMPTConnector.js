/**
 * Created by a on 7/20/2016.
 */



var format = require("stringformat");
var amqp = require('amqp');
var config = require('config');
var uuid = require('node-uuid');


var mongoose = require('mongoose');
var Template = require('../Model/Template').Template;
var dust = require('dustjs-linkedin');
var juice = require('juice');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');



var queueHost = format('amqp://{0}:{1}@{2}:{3}',config.RabbitMQ.user,config.RabbitMQ.password,config.RabbitMQ.ip,config.RabbitMQ.port);
var queueName = config.Host.queueName;


var nodemailer= require('nodemailer');



var smtpHost = {
    host: config.SMTP.ip,
    port: config.SMTP.port,


    pool: true,
    auth: {
        user: config.SMTP.user,
        pass: config.SMTP.password
    },
    tls:{

        rejectUnauthorized: false
    },
    logger: false
};


var waiting = [];


var transporter = nodemailer.createTransport(smtpHost);


var queueConnection = amqp.createConnection({
    url: queueHost
});

queueConnection.on('ready', function () {
    queueConnection.queue(queueName, function (q) {
        q.bind('#');
        q.subscribe({
            ack: true,
            prefetchCount: 10
        }, function (message, headers, deliveryInfo, ack) {

            message = JSON.parse(message.data.toString());

            if (!message || !message.to || !message.from || !message.subject || !message.body || !message.company || !message.tenant) {
                console.log('Invalid message, skipping');
                return ack.reject();
            }
            ///////////////////////////create body/////////////////////////////////////////////////


            waiting.push({
                message: message,
                deliveryTag: deliveryInfo.deliveryTag.toString('hex'),
                ack: ack
            });

            flushWaitingMessages();
        });
    });
});


transporter.on('idle', flushWaitingMessages);


/*



 */

function flushWaitingMessages() {

    var send = function (data) {

        /////////////////////////////////////////////send message(template)/////////////////////////////////////////////

        var mailOptions = {
            from: data.message.from,
            to: data.message.to,
            subject: data.message.subject,
            text: data.message.body,
            html: data.message.body,
            headers: {
                "X-MC-Subaccount": "veery"
            }
        };

        if(data.message.template){
            Template.findOne({name:data.message.template,company:data.message.company,tenant:data.message.tenant},function (errPickTemplate,resPickTemp) {


                if(!errPickTemplate){

                    if(resPickTemp){

                        var compileid = uuid.v4();

                        var compiled = dust.compile(resPickTemp.content.content, compileid);
                        dust.loadSource(compiled);
                        dust.render(compileid, data.message.Parameters, function(errRendered, outRendered) {
                            if(errRendered)
                            {
                                logger.error("Error in rendering "+ errRendered);
                            }
                            else
                            {

                                var renderedTemplate="";
                                var juiceOptions={
                                    applyStyleTags  :true
                                }

                                if(resPickTemp.styles.length>0)
                                {
                                    for(var i=0;i<resPickTemp.styles.length;i++)
                                    {
                                        if (i == 0)
                                        {
                                            renderedTemplate = outRendered;
                                        }

                                        //console.log(resPickTemp.styles[i].content);
                                        logger.info("Rendering is success "+ resPickTemp.styles[i].content);

                                        renderedTemplate=juice.inlineContent(renderedTemplate, resPickTemp.styles[i].content, juiceOptions);
                                        if(i==(resPickTemp.styles.length-1))
                                        {

                                            if(resPickTemp.filetype == 'html') {
                                                mailOptions.html = renderedTemplate;
                                            }else{
                                                mailOptions.text = renderedTemplate;
                                            }
                                            transporter.sendMail(mailOptions, function (err, info) {
                                                if (err) {
                                                    console.log('Message failed (%s): %s', data.deliveryTag, err.message);
                                                    setTimeout(function () {
                                                        data.ack.reject(true);
                                                    }, 1000);
                                                    return;
                                                }
                                                console.log('Message delivered (%s): %s', data.deliveryTag, info.response);
                                                data.ack.acknowledge();
                                            });

                                        }

                                    }



                                }
                                else
                                {
                                    console.log("Rendering Done");

                                    if(resPickTemp.filetype == 'html') {
                                        mailOptions.html = outRendered;
                                    }else{
                                        mailOptions.text = outRendered;
                                    }

                                    transporter.sendMail(mailOptions, function (err, info) {
                                        if (err) {
                                            console.log('Message failed (%s): %s', data.deliveryTag, err.message);
                                            setTimeout(function () {
                                                data.ack.reject(true);
                                            }, 1000);
                                            return;
                                        }
                                        console.log('Message delivered (%s): %s', data.deliveryTag, info.response);
                                        data.ack.acknowledge();
                                    });


                                }

                            }


                        });

                    }else{

                        logger.error("No template found");
                    }

                }else{


                    logger.error("Pick template failed ",errPickTemplate);

                }

            });

        }else{

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log('Message failed (%s): %s', data.deliveryTag, err.message);
                    setTimeout(function () {
                        data.ack.reject(true);
                    }, 1000);
                    return;
                }
                console.log('Message delivered (%s): %s', data.deliveryTag, info.response);
                data.ack.acknowledge();
            });

        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    };


    while (transporter.isIdle() && waiting.length) {
        send(waiting.shift());
    }
}



