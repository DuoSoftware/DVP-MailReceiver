module.exports = {
  "DB": {
    "Type": "postgres",
    "User": "duo",
    "Password": "DuoS123",
    "Port": 5432,
    "Host": "localhost",
    "Database": "dvpdb"
  },


  "Redis":
  {
    mode: "instance", //instance, cluster, sentinel
    ip: "13.52.59.179",
    port: 6379,
    user: "duo",
    password: "DuoS123",
    "sentinels": {
      "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
      "port": 16389,
      "name": "redis-cluster"
    }

  },


  "Security":
  {

    mode: "instance", //instance, cluster, sentinel
    ip: "13.52.59.179",
    port: 6379,
    user: "duo",
    password: "DuoS123",
    "sentinels": {
      "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
      "port": 16389,
      "name": "redis-cluster"
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

  "SMSServer": {


    "ip": "159.203.109.43",
    "port": "1401",
    "password": "bar",
    "user": "foo"



  },

  "LBServer": {

    "ip": "192.168.0.123",
    "port": "4647"

  },



  "SMTP": {

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
    "password": "admin",
    "vhost": '/'
  },

  "Mongo":
  {
    "ip": "facetone-prod.2xyao.mongodb.net",
    "port": "",
    "dbname": "test",
    "password": "Hds7236YD",
    "user": "facetone",
    "type": "mongodb+srv"
  },
  //mongodb+srv://facetone:Hds7236YD@facetone-prod.2xyao.mongodb.net/test?authSource=admin&replicaSet=atlas-unwxnp-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true

  "Services": {
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjIzMzQxMjMzNjAsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAyMDk3NjB9.isD_qzGsNxPsFdNcuAr1-bYgCURs06eXnxJG1t8ALag",


    "resourceServiceHost": "app.facetone.com",
    "resourceServicePort": "1443",
    "resourceServiceVersion": "1.0.0.0",


    "interactionurl": "app.facetone.com",
    "interactionport": '1443',
    "interactionversion": "1.0.0.0",


    "cronurl": "app.facetone.com",
    "cronport": '1443',
    "cronversion": "1.0.0.0",


    "ticketServiceHost": "app.facetone.com",
    "ticketServicePort": "1443",
    "ticketServiceVersion": "1.0.0.0",

    "ardsServiceHost": "app.facetone.com",
    "ardsServicePort": "1443",
    "ardsServiceVersion": "1.0.0.0",


    "uploadurl": 'app.facetone.com',
    "uploadport": '1443',
    "uploadurlVersion": "1.0.0.0",
    "dynamicPort": true,
    "protocol": "https"



  }



};
