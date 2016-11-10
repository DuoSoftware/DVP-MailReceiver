module.exports = {
    "DB": {
        "Type":"SYS_DATABASE_TYPE",
        "User":"SYS_DATABASE_POSTGRES_USER",
        "Password":"SYS_DATABASE_POSTGRES_PASSWORD",
        "Port":"SYS_SQL_PORT",
        "Host":"SYS_DATABASE_HOST",
        "Database":"SYS_DATABASE_POSTGRES_USER"
    },


    "Redis":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },

    "Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    },

    "Mongo":
    {
        "ip":"SYS_MONGO_HOST",
        "port":"SYS_MONGO_PORT",
        "dbname":"SYS_MONGO_DB",
        "password":"SYS_MONGO_PASSWORD",
        "user":"SYS_MONGO_USER"

    },

    "RabbitMQ":
    {
        "ip": "SYS_RABBITMQ_HOST",
        "port": "SYS_RABBITMQ_PORT",
        "user": "SYS_RABBITMQ_USER",
        "password": "SYS_RABBITMQ_PASSWORD"
    },


    "Host":
    {
        "vdomain": "LB_FRONTEND",
        "domain": "HOST_NAME",
        "port": "HOST_USERSERVICE_PORT",
        "version": "HOST_VERSION",
        "smtplistner": "HOST_ENABLE_SMTPLISTNER",
        "smtpsender": "HOST_ENABLE_SMTPSENDER",
        "smssender": "HOST_ENABLE_SMSSENDER",
        "imaplistner": "HOST_ENABLE_IMAPLISTNER",
    },

    "LBServer" : {

        "ip": "LB_FRONTEND",
        "port": "LB_PORT"

    },

    "IMAP":
    {
        "username":"IMAP_USER_NAME",
        "password":"IMAP_PASSWORD",
        "host":"IMAP_HOST",
        "port":"IMAP_PORT",
        "secure":true,
        "mailbox":"IMAP_MAILBOX",
        "seen":true,
        "company": "IMAP_COMPANY",
        "tenant": "IMAP_TENAT",
        "fetch":true


    },

    "SMTP":{

        "ip": "SMTP_HOST",
        "port": "SMTP_PORT",
        "user": "SMTP_USER_NAME",
        "password": "SMTP_PASSWORD"

    },



    "Services" : {
        "accessToken": "HOST_TOKEN",
        "resourceServiceHost": "SYS_RESOURCESERVICE_HOST",
        "resourceServicePort": "SYS_RESOURCESERVICE_PORT",
        "resourceServiceVersion": "SYS_RESOURCESERVICE_VERSION",
        "uploadurl": "SYS_FILESERVICE_HOST",
        "uploadport":"SYS_FILESERVICE_PORT",
        "uploadurlVersion":"SYS_FILESERVICE_VERSION",

        "interactionurl": "SYS_INTERACTION_HOST",
        "interactionport": "SYS_INTERACTION_PORT",
        "interactionversion":"SYS_INTERACTION_VERSION",


        "cronurl": "SYS_SCHEDULEWORKER_HOST",
        "cronport": "SYS_SCHEDULEWORKER_PORT",
        "cronversion":"SYS_SCHEDULEWORKER_VERSION",


        "ticketServiceHost": "SYS_LITETICKET_HOST",
        "ticketServicePort":  "SYS_LITETICKET_PORT",
        "ticketServiceVersion":  "SYS_LITETICKET_VERSION",
    }
};

//NODE_CONFIG_DIR
