module.exports = {
  Host: {
    port: "HOST_MAILRECEIVER_PORT",
    version: "HOST_VERSION",
    smtplistner: "HOST_MAILRECEIVER_SMTP_LISTENER_ENABLED"
  },
  LBServer: {
    ip: "SYS_LB_HOST",
    port: "SYS_LB_PORT"
  },
  Mongo: {
    ip: "SYS_MONGO_HOST",
    port: "SYS_MONGO_PORT",
    dbname: "SYS_MONGO_DB",
    password: "SYS_MONGO_PASSWORD",
    user: "SYS_MONGO_USER"
  },
  Services: {
    accessToken: "HOST_TOKEN",
    uploadurl: "SYS_FILESERVICE_HOST",
    uploadport: "SYS_FILESERVICE_PORT",
    uploadurlVersion: "SYS_FILESERVICE_VERSION",
    interactionurl: "SYS_INTERACTIONS_HOST",
    interactionport: "SYS_INTERACTIONS_PORT",
    interactionversion: "SYS_INTERACTIONS_VERSION",
    cronurl: "SYS_SCHEDULEWORKER_HOST",
    cronport: "SYS_SCHEDULEWORKER_PORT",
    cronversion: "SYS_SCHEDULEWORKER_VERSION",
    ticketServiceHost: "SYS_LITETICKET_HOST",
    ticketServicePort: "SYS_LITETICKET_PORT",
    ticketServiceVersion: "SYS_LITETICKET_VERSION",
    ardsServiceHost: "SYS_ARDSLITESERVICE_HOST",
    ardsServicePort: "SYS_ARDSLITESERVICE_PORT",
    ardsServiceVersion: "SYS_ARDSLITESERVICE_VERSION"
  }
};
