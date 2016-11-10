module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"duo",
    "Password":"DuoS123",
    "Port":5432,
    "Host":"localhost",
    "Database":"dvpdb"
  },


  "Redis":
  {
    "ip": "45.55.142.207",
    "port": 6389,
    "user": "duo",
    "password": "DuoS123"

  },


  "Security":
  {
    "ip" : "45.55.142.207",
    "port": 6389,
    "user": "duo",
    "password": "DuoS123"
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
    "smtplistner": false,
    "smtpsender": false,
    "smssender": false,
    "imaplistner": true
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

   "ip": "smtp.mandrillapp.com",
   "port": "2525",
   "user": "rangika@duosoftware.com",
   "password": "5eTFMlNGlGnZ7xTmI3LAxQ"

   },




  "RabbitMQ":
  {
    "ip": "45.55.142.207",
    "port": 5672,
    "user": "admin",
    "password": "admin"
  },

  "Mongo":
  {
    "ip":"45.55.142.207",
    "port":"27017",
    "dbname":"dvpdb",
    "password":"DuoS123",
    "user":"duo"
  },

  "IMAP":
  {
    "username":"duodemouser@gmail.com",
    "password":"DuoS123456",
    "host":"imap.gmail.com",
    "port":993,
    "secure":true,
    "mailbox":"INBOX",
    "seen":true,
    "company": 103,
    "tenant": 1,
    "fetch":true


  },




    "Services" : {
      "accessToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiMTdmZTE4M2QtM2QyNC00NjQwLTg1NTgtNWFkNGQ5YzVlMzE1Iiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE4OTMzMDI3NTMsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NjEyOTkxNTN9.YiocvxO_cVDzH5r67-ulcDdBkjjJJDir2AeSe3jGYeA",


      "resourceServiceHost": "resourceservice.104.131.67.21.xip.io",
      "resourceServicePort": "8831",
      "resourceServiceVersion": "1.0.0.0",


      "interactionurl": "interactions.app.veery.cloud",
      "interactionport": '3637',
      "interactionversion":"1.0.0.0",


      "cronurl": "192.168.0.27",
      "cronport": '8080',
      "cronversion":"1.0.0.0",


      "ticketServiceHost": "127.0.0.1",
      "ticketServicePort": "3636",
      "ticketServiceVersion": "1.0.0.0",

      "ardsServiceHost": "ardsliteservice.104.131.67.21.xip.io",
      "ardsServicePort": "8831",
      "ardsServiceVersion": "1.0.0.0",


      "uploadurl": 'fileservice.app.veery.cloud',
      "uploadport": '8888',
      "uploadurlVersion": "1.0.0.0"



    }



};