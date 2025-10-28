const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "blood-smear-app",
  brokers: ["localhost:9092"], // <-- broker can be your local machine or a remote machine
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
}

// producer sends the message to the queue and the message is consumed by the consumer
async function sendJobToQueue(job_id) {
  const payload = { job_id };
  await producer.send({
    //topic that we created is image-processing
    topic: "image-processing",
    //you can add partition here if you want to send the message to a specific partition
    messages: [{ value: JSON.stringify(payload) }],
  });
}


module.exports = { connectProducer, sendJobToQueue };


