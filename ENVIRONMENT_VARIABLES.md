# Environment variables

Every environment variable DVP-MailReceiver reads, with the values it accepts.

- The service maps config keys to these names in `config/custom-environment-variables.js`. The defaults are in `config/default.js`.
- **Default** is what the service uses when the variable is not set. Real hosts, URLs and secrets are never written here: `(environment-specific)` and `<secret>` stand in for them.
- **Required** is "yes" when the service has no usable default, and for every host, URL and secret.
- Names follow the Facetone naming standard. Whenever a variable is added, renamed or removed, or its meaning, values or default change, update this file in the same change. See `.claude/rules/environment-variables.md`.

## Service variables

Settings only this service reads (`HOST_MAILRECEIVER_*`).

| Variable | Description | Type | Possible values | Default | Required | Secret |
| --- | --- | --- | --- | --- | --- | --- |
| `HOST_MAILRECEIVER_PORT` | Port DVP-MailReceiver listens on. | port | 1–65535 | 4647 | no | no |
| `HOST_MAILRECEIVER_SMTP_LISTENER_ENABLED` | Run the SMTP listener that receives email. | bool | true \| false | true | no | no |

## Shared variables

Infrastructure, other services' addresses and platform settings. Other services read them under the same names.

| Variable | Description | Type | Possible values | Default | Required | Secret |
| --- | --- | --- | --- | --- | --- | --- |
| `HOST_TOKEN` | Access token this service sends when it calls other services. | string | JWT | `<secret>` | yes | yes |
| `HOST_VERSION` | API version segment of this service's own routes (/DVP/API/\<version>/...). | version | version string, e.g. 1.0.0.0 | 1.0 | no | no |
| `SYS_ARDSLITESERVICE_HOST` | Host other services use to call DVP-ARDSLiteService. | host | host name or IP, e.g. ardsliteservice.internal | (environment-specific) | yes | no |
| `SYS_ARDSLITESERVICE_PORT` | Port of DVP-ARDSLiteService; added to the URL only when SYS_DYNAMIC_PORT_ENABLED is true. | port | 1–65535 | 8831 | no | no |
| `SYS_ARDSLITESERVICE_VERSION` | API version used in DVP-ARDSLiteService URLs. | version | version string, e.g. 1.0.0.0 | 1.0.0.0 | no | no |
| `SYS_FILESERVICE_HOST` | Host other services use to call DVP-FileService. | host | host name or IP, e.g. fileservice.internal | (environment-specific) | yes | no |
| `SYS_FILESERVICE_PORT` | Port of DVP-FileService; added to the URL only when SYS_DYNAMIC_PORT_ENABLED is true. | port | 1–65535 | 8888 | no | no |
| `SYS_FILESERVICE_VERSION` | API version used in DVP-FileService URLs. | version | version string, e.g. 1.0.0.0 | 1.0.0.0 | no | no |
| `SYS_INTERACTIONS_HOST` | Host other services use to call DVP-Interactions. | host | host name or IP, e.g. interactions.internal | (environment-specific) | yes | no |
| `SYS_INTERACTIONS_PORT` | Port of DVP-Interactions; added to the URL only when SYS_DYNAMIC_PORT_ENABLED is true. | port | 1–65535 | 3637 | no | no |
| `SYS_INTERACTIONS_VERSION` | API version used in DVP-Interactions URLs. | version | version string, e.g. 1.0.0.0 | 1.0.0.0 | no | no |
| `SYS_LB_HOST` | Public host of the load balancer / API gateway; used to build URLs to other services. | host | host name | (environment-specific) | yes | no |
| `SYS_LB_PORT` | Port of the load balancer. | port | 1–65535 | 4647 | no | no |
| `SYS_LITETICKET_HOST` | Host other services use to call DVP-LiteTicket. | host | host name or IP, e.g. liteticket.internal | (environment-specific) | yes | no |
| `SYS_LITETICKET_PORT` | Port of DVP-LiteTicket; added to the URL only when SYS_DYNAMIC_PORT_ENABLED is true. | port | 1–65535 | 3636 | no | no |
| `SYS_LITETICKET_VERSION` | API version used in DVP-LiteTicket URLs. | version | version string, e.g. 1.0.0.0 | 1.0.0.0 | no | no |
| `SYS_MONGO_DB` | MongoDB database name. | string | database name | dvpdb | no | no |
| `SYS_MONGO_HOST` | MongoDB host(s). | host | host name or IP; comma-separated list for a replica set | (environment-specific) | yes | no |
| `SYS_MONGO_PASSWORD` | MongoDB password. | string | password | `<secret>` | yes | yes |
| `SYS_MONGO_PORT` | MongoDB port. | port | 1–65535; leave empty for mongodb+srv | 27017 | no | no |
| `SYS_MONGO_USER` | MongoDB user. | string | user name | duo | no | no |
| `SYS_SCHEDULEWORKER_HOST` | Host other services use to call DVP-ScheduleWorker. | host | host name or IP, e.g. scheduleworker.internal | (environment-specific) | yes | no |
| `SYS_SCHEDULEWORKER_PORT` | Port of DVP-ScheduleWorker; added to the URL only when SYS_DYNAMIC_PORT_ENABLED is true. | port | 1–65535 | 8080 | no | no |
| `SYS_SCHEDULEWORKER_VERSION` | API version used in DVP-ScheduleWorker URLs. | version | version string, e.g. 1.0.0.0 | 1.0.0.0 | no | no |

## Reserved variables

Read straight from the environment by the logger, node-config or the service code. These names never change.

| Variable | Description | Type | Possible values | Default | Required | Secret |
| --- | --- | --- | --- | --- | --- | --- |
| `DEPLOYMENT_ENV` | docker turns off the log file, so the logger writes to the console only. | string | docker, or unset | unset: console and file | no | no |
| `HOST_NAME` | Name of the running instance. The logger sends it to Logstash as the app name. | string | host name | — | no | no |
| `LOG_LEVEL` | Lowest level the logger writes. | enum | error \| warn \| info \| verbose \| debug \| silly | debug | no | no |
| `LOG_PATH` | Folder for logger.log. Not used when DEPLOYMENT_ENV is docker. | path | folder path, e.g. /var/log/facetone | unset: logger.log in the working folder | no | no |
| `NODE_CONFIG_DIR` | Folder node-config reads its files from. | path | path to the config folder | ./config | no | no |
| `NODE_ENV` | node-config loads config/\<NODE_ENV>.js over config/default.js. Environment variables override both. | string | name of a file in config/, e.g. production | development | no | no |
| `SYS_LOG_HOST` | Logstash host that receives the logs over UDP. Logs are sent only when SYS_LOG_HOST and SYS_LOG_PORT are both set. | host | host name or IP, e.g. logstash.internal | unset: not sent | no | no |
| `SYS_LOG_PORT` | Logstash UDP port. Used with SYS_LOG_HOST. | port | 1–65535 | unset: not sent | no | no |
