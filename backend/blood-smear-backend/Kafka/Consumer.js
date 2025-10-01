const { Kafka } = require("kafkajs");
require("dotenv").config();
const mongoose = require("mongoose");
const { scanFileForVirus } = require("../utility/virusScanner.js");
const UploadMetadata = require("../models/UploadMetadata.js");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { uploadImagesToS3 } = require("../utility/S3Upload.js");

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
async function processJob(job) {
  const jobId = job.job_id;

  try {
    console.log(` Processing started for job:${jobId}`);
    const jobData = job.data || job;

    const {
      whole_slide_image_path: wholeSlidePath,
      cellavision_image_paths: cellavisionImagePaths = {},
    } = jobData;

    // Store temp file path
    await UploadMetadata.updateOne(
      { job_id: jobId },
      { $set: { "whole_slide_image.temp_file_path": wholeSlidePath } }
    );

    // Scan whole slide image
    const scanningforfullSlide = await isFileClean(wholeSlidePath);
    // If the whole slide image is infected, update metadata and throw error
    if (!scanningforfullSlide) {
      await UploadMetadata.updateOne(
        { job_id: jobId },
        {
          $set: {
            is_image_corrupted: true,
            status: "failed",
            error_message: "Whole slide image is infected",
          },
        }
      );
      throw new Error(`[${jobId}] Whole slide image is infected`);
    }
    // Scan all cellavision images
    for (const [cellType, imagePaths] of Object.entries(
      cellavisionImagePaths
    )) {
      for (const imagePath of imagePaths) {
        const clean = await isFileClean(imagePath);
        if (!clean) {
          await UploadMetadata.updateOne(
            { job_id: jobId },
            {
              $set: {
                is_image_corrupted: true,
                status: "failed",
                error_message: `Infected cellavision image in ${cellType}`,
              },
            }
          );
          throw new Error(
            `[${jobId}] Cellavision image infected: ${imagePath}`
          );
        }
      }
    }

    // All clean
    await UploadMetadata.updateOne(
      { job_id: jobId },
      { $set: { is_image_corrupted: false, status: "clean" } }
    );
    //convert VSI to TIFF if needed
    const result = await UploadMetadata.findOne({ job_id: jobId });
    // If the result is clean, proceed with conversion
    if (result?.status === "clean") {
      const { original_filename, temp_file_path } = result.whole_slide_image;
      const inputImagePath =
        result?.whole_slide_image?.temp_file_path || wholeSlidePath;
      const outputImagePathTiff = inputImagePath.replace(/\.vsi$/i, ".tiff");

      if (original_filename.endsWith(".vsi")) {
        console.log(
          `[${jobId}] Converting ${inputImagePath} to ${outputImagePathTiff}`
        );
        const conversionResult = await convertVsiToTiff(
          inputImagePath,
          outputImagePathTiff
        );
        if (conversionResult.success) {
          await UploadMetadata.updateOne(
            { job_id: jobId },
            {
              $set: {
                "whole_slide_image.converted_to_tiff": true,
                "whole_slide_image.tiff_file_path": conversionResult.outputPath,
              },
            }
          );

          //uplod images to AWS S3 Bucket
          console.log(`[${jobId}] 📤 Starting S3 uploads...`);
          const s3UploadResult = await uploadImagesToS3(jobId);
          if (s3UploadResult.success) {
            console.log(`[${jobId}] 📤 S3 uploads completed successfully!`);
          }
        }
      }
    }
  } catch (err) {
    await UploadMetadata.updateOne(
      { job_id: jobId },
      {
        $set: {
          status: "failed",
          error_message: err.message,
          is_image_corrupted: true,
        },
      }
    );
    console.error(`[${jobId}] Processing failed:`, err);
  }
}

//converts windows path to /mnt/c/ style path for WSL compatibility
function toWslPath(winPath) {
  return (
    "/mnt/" + winPath[0].toLowerCase() + winPath.slice(2).replace(/\\/g, "/")
  );
}

async function convertVsiToTiff(inputPath, outputPath) {
  //script path
  const scriptPath = path.resolve(__dirname, "../script/convert_bioformat.sh");

  try {
    console.log(`Converting ${inputPath} to ${outputPath}...`);

    // for WSL compatibility
    // wsl bash "/mnt/c/Blood-Smear-Database-App/backend/blood-smear-backend/script/convert_bioformat.sh" "/mnt/c/Blood-Smear-Database-App/backend/blood-smear-backend/uploads/ce726cac-071d-47dc-b0b4-d198b39ed1e9/whole_slide/22K002-1.vsi" "/mnt/c/Blood-Smear-Database-App/backend/blood-smear-backend/uploads/ce726cac-071d-47dc-b0b4-d198b39ed1e9/whole_slide/22K002-1.tiff"
    const command = `wsl bash "${toWslPath(scriptPath)}" "${toWslPath(
      inputPath
    )}" "${toWslPath(outputPath)}"`;
    console.log(`Running command: ${command}`);

    const { stdout, stderr } = await exec(command, {
      timeout: 300000,
      maxBuffer: 1024 * 1024 * 10,
    });

    if (stdout) console.log(`Conversion stdout: ${stdout}`);
    if (stderr) console.warn(`Conversion stderr: ${stderr}`);

    const fs = require("fs");
    if (fs.existsSync(outputPath)) {
      console.log(`✅ Conversion successful: ${outputPath}`);
      return { success: true, outputPath };
    } else {
      throw new Error("Output file was not created");
    }
  } catch (error) {
    console.error(` Conversion failed for ${inputPath}:`, error.message);
    return {
      success: false,
      error: error.message,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
    };
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
      const job = JSON.parse(message.value.toString());
      console.log("Received job from Kafka:", job);
      const jobId = job.job_id;

      let dbJob = await UploadMetadata.findOne({ job_id: jobId });
      console.log(`[${jobId}] Received job:`, job);

      if (!dbJob) {
        dbJob = await UploadMetadata.create({
          job_id: jobId,
          status: "processing",
        });
      }

      await processJob(job);
    },
  });
}

run().catch((e) => {
  console.error("Fatal consumer error:", e);
  process.exit(1);
});
