config = {};

config.rabbitMqServer = "amqp://192.168.1.214:5672";
config.receiverQueueName = "user-engine";
config.senderQueueName = "engine-user";

module.exports.config = config;
