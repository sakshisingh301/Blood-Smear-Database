const { Kafka } = require("kafkajs");
require("dotenv").config();
const mongoose = require("mongoose");
const { scanS3StreamForVirusStreaming } = require("../utility/virusScanner.js");
const UploadMetadata = require("../models/UploadMetadata.js");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { streamToRawBucket, getRawFileStream } = require("../utility/S3Upload.js");

// 1. Connect to MongoDB
mongoose.connect(
  "mongodb+srv://skhsingh:kJcy8ZWBATFV6uz8@cluster0.2c0gaiq.mongodb.net/Blood_Smear_Database?retryWrites=true&w=majority&appName=Cluster0"
);

// 2. Kafka setup
const kafka = new Kafka({
  clientId: "blood-smear-worker",
  brokers: ["localhost:9092"], // Adjust if Kafka is remote
});

// 3. Create consumer in a group
const consumer = kafka.consumer({ groupId: "image-processing-group" });

// 4. Job processing logic
  async function processJob(job_id){
    console.log(` Starting processing for job: ${job_id}`);
    //get the job from the database
    const job = await UploadMetadata.findOne({ job_id: job_id });
    

    if (!job) {
      console.error(`[${job_id}]  No job found in DB`);
      throw new Error("Job not found");
    }
   
    
    //create a step function divide the larger whole slide images into and call the lambda function which executes the clamAV scan

    //check the virus scan for cellavision images, use existing ClamAV function
    if (job.cellavision_images && job.cellavision_images.size > 0) {
      
      
      for (const [cellType, images] of job.cellavision_images.entries()) {
        
        
        for (const image of images) {
          if (image.s3_storage?.s3_key) {
            
            
            const scanResult = await scanS3StreamForVirusStreaming(image.s3_storage.s3_key);
            
            if (!scanResult.success) {
              
              await UploadMetadata.updateOne({job_id: job_id}, {status: "failed"});
              throw new Error(`Virus scan failed for cellavision image: ${image.original_filename}`);
            }
            
            if (scanResult.isInfected) {
              
              await UploadMetadata.updateOne({job_id: job_id}, {status: "failed"});
              throw new Error(`Virus detected in cellavision image: ${image.original_filename}`);
            }
            
            
          }
        }
      }
      
      console.log(`[${job_id}] All cellavision images passed virus scan`);
    }
    //update status to virus_clean
     await UploadMetadata.updateOne({job_id: job_id}, {status: "virus_clean"});

    //process the whole slide image
    if(job.whole_slide_image)
    {
      
    }


  }

    



async function isFileClean(filePath) {
  const { isInfected, viruses } = await scanFileForVirus(filePath);
  if (isInfected) {
    console.warn(`Detected: ${viruses.join(", ")}`);
    return false;
  }
  return true;
}
// 5. Main loop: listen for jobs and process
async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "image-processing", fromBeginning: true });

  await consumer.run({
    
    eachMessage: async ({ message }) => {
      const {job_id} = JSON.parse(message.value.toString());
      console.log("Received job from Kafka:", job_id);
      await processJob(job_id);
    },
  });
}

run().catch((e) => {
  console.error("Fatal consumer error:", e);
  process.exit(1);
});
