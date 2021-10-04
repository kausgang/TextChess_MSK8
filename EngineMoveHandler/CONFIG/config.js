config = {};

config.expressPort = 7000;
config.rabbitMqServer = "amqp://192.168.1.214:5672";
config.queueName = "engine-user";

module.exports.config = config;
