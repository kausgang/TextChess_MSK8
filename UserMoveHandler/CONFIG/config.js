config = {};

config.expressPort = 3000;
config.rabbitMqServer = "amqp://192.168.1.214:5672";
config.queueName = "user-engine";

module.exports.config = config;
