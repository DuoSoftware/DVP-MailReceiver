module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"",
    "Password":"",
    "Port":5432,
    "Host":"localhost",
    "Database":""
  },


   "Redis":
    {
        "mode":"sentinel",//instance, cluster, sentinel
        "ip": "",
        "port": 6389,
        "user": "",
        "password": "",
        "sentinels":{
            "hosts": "",
            "port":16389,
            "name":"redis-cluster"
        }

    },


    "Security":
    {

        "ip" : "",
        "port": 6389,
        "user": "",
        "password": "",
        "mode":"sentinel",//instance, cluster, sentinel
        "sentinels":{
            "hosts": "",
            "port":16389,
            "name":"redis-cluster"
        }
    },


  "Host":
  {
    "ServerType": "SOCIALMEDIACONNECTOR",
    "CallbackOption": "GET",
    "RequestType": "CALL",
    "ServerID": 2,
    "resource": "cluster",
    "vdomain": "localhost",
    "domain": "localhost",
    "port": "4647",
    "emailQueueName": "EMAILOUT",
    "smsQueueName": "SMSOUT",
    "version": "1.0",
    "smtplistner": true,
    "smtpsender": true,
    "smssender": true,
    "imaplistner": false
  },

  "SMSServer":{


    "ip":"",
    "port":"1401",
    "password":"bar",
    "user":"foo"



  },

  "LBServer" : {

    "ip": "",
    "port": "4647"

  },



   "SMTP":{

   "ip": "",
   "port": "2525",
   "user": "",
   "password": ""

   },




  "RabbitMQ":
  {
    "ip": "",
    "port": 5672,
    "user": "",
    "password": "",
    "vhost":'/'
  },

  "Mongo":
  {
    "ip":"",
    "port":"27017",
    "dbname":"",
    "password":"",
    "user":""
  },

    "Services" : {
      "accessToken":"",


      "resourceServiceHost": "",
      "resourceServicePort": "8831",
      "resourceServiceVersion": "1.0.0.0",


      "interactionurl": "",
      "interactionport": '3637',
      "interactionversion":"1.0.0.0",


      "cronurl": "",
      "cronport": '8080',
      "cronversion":"1.0.0.0",


      "ticketServiceHost": "",//liteticket.app.veery.cloud
      "ticketServicePort": "3636",
      "ticketServiceVersion": "1.0.0.0",

      "ardsServiceHost": "",
      "ardsServicePort": "8831",
      "ardsServiceVersion": "1.0.0.0",


      "uploadurl": '',
      "uploadport": '8888',
      "uploadurlVersion": "1.0.0.0"



    }



};
