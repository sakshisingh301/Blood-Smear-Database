const NodeClam = require("clamscan");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const AWS = require("aws-sdk");

// Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const S3_BUCKET_RAW = process.env.S3_BUCKET_RAW;

let clamAV = null;

async function initClamAV() {
  if (clamAV) return clamAV;

  clamAV = await new NodeClam().init({
    removeInfected: false,
    quarantineInfected: false,
    clamdscan: {
      socket: false,
      host: "127.0.0.1",
      port: 3310,
      timeout: 120000,
    },
  });

  return clamAV;
}

async function scanS3StreamForVirusStreaming(s3Key, bucketName = S3_BUCKET_RAW) {
  try {
    const clam = await initClamAV();
    
    // Create a readable stream from S3
    const s3Stream = s3.getObject({
      Bucket: bucketName,
      Key: s3Key
    }).createReadStream();
    
    // Scan the stream
    const { isInfected, viruses } = await clam.scanStream(s3Stream);
    
    return { 
      isInfected, 
      viruses,
      success: true
    };
  } catch (error) {
    console.error(`Error scanning S3 stream ${s3Key}:`, error);
    return {
      isInfected: false,
      viruses: [],
      success: false,
      error: error.message
    };
  }
}

module.exports = { scanS3StreamForVirusStreaming };