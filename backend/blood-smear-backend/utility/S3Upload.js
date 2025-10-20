const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const AWS = require("aws-sdk");
const fs = require("fs");
const UploadMetadata = require("../models/UploadMetadata.js");
const { Readable } = require("stream");



const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const S3_BUCKET_RAW = process.env.S3_BUCKET_RAW;
const S3_BUCKET_PROCESSED = process.env.S3_BUCKET_PROCESSED;
const CLOUD_FRONT_DOMAIN = process.env.CLOUD_FRONT_DOMAIN;

//s3 key decides the structure of the folder in the s3 bucket
function generateS3Key(job_id,fileName,fileTypes,cellTypes) {

  if(fileTypes==="whole_slide"){
    return `uploads/${job_id}/whole_slide/${fileName}`;
  }else if(fileTypes==="cellavision"){
    return `uploads/${job_id}/cellavision/${cellTypes}/${fileName}`;
  }
 
}

async function uploadToProcessedBucket(buffer, s3Key, contentType, metadata = {}) {
  try {
    const stream = Readable.from(buffer);
    
    const params = {
      Bucket: S3_BUCKET_PROCESSED,
      Key: s3Key,
      Body: stream,
      ACL: "private",
      ContentType: contentType,
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'bucket-type': 'processed',
        ...metadata
      }
    };

    const result = await s3.upload(params).promise();
    
    // Generate CloudFront URL only for processed files
    const cloudfrontUrl = `${CLOUD_FRONT_DOMAIN}/${s3Key}`;

    return {
      success: true,
      bucket_name: S3_BUCKET_RAW,
      s3_url: result.Location,
      s3_key: result.Key,
      s3_etag: result.ETag,
      s3_bucket: result.Bucket,
      cloudfront_url: cloudfrontUrl, // CloudFront URL for processed files
      uploaded_at: new Date(),
      upload_success: true,
    };
  } catch (err) {
    console.error("Processed S3 upload error:", err);
    return {
      success: false,
      error: err.message,
      upload_success: false,
    };
  }
}



async function streamToRawBucket(fileBuffer, s3Key, originalFilename, mimeType) {
  try {
    const stream = Readable.from(fileBuffer);
    
    const params = {
      Bucket: S3_BUCKET_RAW,
      Key: s3Key,
      Body: stream,
      ACL: "private",
      ContentType: mimeType,
      Metadata: {
        'original-filename': originalFilename,
        'uploaded-at': new Date().toISOString(),
        'job-id': s3Key.split('/')[0],
        'bucket-type': 'raw'
      }
    };

    const fileSizeInMb = fileBuffer.length / (1024 * 1024);
    let result;
    
    if (fileSizeInMb > 100) {
      console.log(`Large file detected (${fileSizeInMb.toFixed(2)}MB), using multipart upload`);
      result = await s3.upload(params, {
        partSize: 10 * 1024 * 1024,
        queueSize: 4
      }).promise();
    } else {
      console.log(`Small file detected (${fileSizeInMb.toFixed(2)}MB), using single upload`);
      result = await s3.upload(params).promise();
    }

    return {
      success: true,
      bucket_name: S3_BUCKET_RAW,
      s3_url: result.Location,
      s3_key: result.Key,
      s3_etag: result.ETag,
      s3_bucket: S3_BUCKET_RAW,
      cloudfront_url: null,
      uploaded_at: new Date(),
      upload_success: true,
      bucket_type: 'raw',
    };
  } catch (err) {
    console.error("Raw S3 streaming upload error:", err);
    return {
      success: false,
      error: err.message,
      upload_success: false,
    };
  }
}

/**
 * Get files from raw bucket for processing (uses S3 URL)
 */
async function getRawFileStream(s3Key,bucketName) {
  try {
    const params = {
      Bucket: bucketName,
      Key: s3Key
    };
    
    const s3Object = await s3.getObject(params).promise();
    return s3Object.Body;
  } catch (error) {
    console.error(`Failed to get file from raw bucket: ${s3Key}`, error);
    throw error;
  }
}
module.exports={
  generateS3Key,
  uploadToProcessedBucket,
  streamToRawBucket,
  getRawFileStream,
};


