module.exports = {
   "DB":{
        "type":"postgres",
        "user":"duo",
        "password":"DuoS123",
        "database":"facetone",
        "host":"172.16.25.32",
        "port":"5432"
    },


  Redis: {
    mode: "instance", //instance, cluster, sentinel
    ip: "",
    port: 6389,
    user: "",
    db: 2,
    password: "",
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster"
    }
  },

  Security: {
    ip: "",
    port: 6389,
    user: "",
    password: "",
    mode: "instance", //instance, cluster, sentinel
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster"
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
    "port": "8877",
    "emailQueueName": "EMAILOUT",
    "smsQueueName": "SMSOUT",
    "version": "1.0",
    "smtplistner": false,
    "smtpsender": true,
    "smssender": true,
    "imaplistner": false
  },

  "SMSServer":{


    "ip":"159.203.109.43",
    "port":"1401",
    "password":"bar",
    "user":"foo"



  },

  "LBServer" : {

    "ip": "192.168.0.123",
    "port": "4647"

  },


   "SMTP":{
   "ip": "8e5gpvyrrkde.uemp.mail-manager-smtp.amazonaws.com",
   "port": "587",
   "user": "inp-zasdmjo5xy7537tuaakgznqh",
   "password": "Duo$Smtp#26"
   },

  "RabbitMQ":
  {
    "ip": "172.16.25.32",
    "port": 5672,
    "user": "duo",
    "password": "DuoS123",
    "vhost":'/'
  },

     "Mongo": {
        "ip": "172.16.25.32",
        "port": 27017,
        "dbname": "facetone",
        "password": "DuoS123",
        "user": "duo",
        "type": "mongodb",
    },

    "Services" : {
      "accessToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJmcm9kb29kIiwianRpIjoiMDIxYzQ4MWEtNTUxMC00MzlkLTk1YjgtZWY5OTY3MmY1ZmFhIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjIzMzQxMjMzNjAsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAyMDk3NjB9.Wh-E2OVg6nwsicj9yQdx92js6rPg6pzkZkmwk69FHmc",


      "resourceServiceHost": "resourceservice.104.131.67.21.xip.io",
      "resourceServicePort": "8831",
      "resourceServiceVersion": "1.0.0.0",


      "interactionurl": "interactions.facetonelite.com",
      "interactionport": '3637',
      "interactionversion":"1.0.0.0",


      "cronurl": "192.168.0.27",
      "cronport": '8080',
      "cronversion":"1.0.0.0",


      "ticketServiceHost": "liteticket.facetonelite.com",
      "ticketServicePort": "3636",
      "ticketServiceVersion": "1.0.0.0",

      "ardsServiceHost": "ardsliteservice.facetonelite.com",
      "ardsServicePort": "8831",
      "ardsServiceVersion": "1.0.0.0",


      "uploadurl": 'fileservice.facetonelite.com',
      "uploadport": '5432',
      "uploadurlVersion": "1.0.0.0"



    }



};
