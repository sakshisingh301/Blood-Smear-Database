const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "blood-smear-app",
  brokers: ["localhost:9092"], // <-- replace with your broker's address
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
}

async function sendJobToQueue(job_id) {
  const payload = { job_id };
  await producer.send({
    topic: "image-processing",
    messages: [{ value: JSON.stringify(payload) }],
  });
}


module.exports = { connectProducer, sendJobToQueue };


