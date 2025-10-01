const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const AWS = require("aws-sdk");
const fs = require("fs");
const UploadMetadata = require("../models/UploadMetadata.js");



const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const S3_BUCKET = process.env.S3_BUCKET;
const CLOUD_FRONT_DOMAIN = process.env.CLOUD_FRONT_DOMAIN;

/**
 * Uploads a single file to S3 and returns S3/CloudFront metadata.
 */
async function uploadToS3(localPath, s3Key) {
  try {
    


    const fileStream = fs.createReadStream(localPath);
    const params = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: fileStream,
      ACL: "private",
    };
    //check file size, if size is 100MB then use multipart upload else use single upload
    const stats = fs.statSync(localPath);
    const fileSizeInMb=stats.size/1024/1024;
    let result;
    if(fileSizeInMb>100){
      // S3 will:
// 1. Split into 80 parts of 10MB
// 2. Upload 4 parts at a time
// 3. Total upload time: ~3-5 minutes instead of 15-20 minutes
// 4. Much more reliable for large files

      console.log(`Large file detected (${fileSizeInMb.toFixed(2)}MB), using multipart upload`);
      result = await s3.upload(params, {
        partSize: 10 * 1024 * 1024, // 10MB parts
        queueSize: 4 // Parallel uploads
      }).promise();

    }
    else{
      console.log(`Small file detected (${fileSizeInMb.toFixed(2)}MB), using single upload`);
      result = await s3.upload(params).promise();
    }

    const cloudfrontUrl = `${CLOUD_FRONT_DOMAIN}/${s3Key}`;

    return {
      success: true,
      s3_url: result.Location,
      s3_key: result.Key,
      s3_etag: result.ETag,
      s3_bucket: result.Bucket,
      cloudfront_url: cloudfrontUrl,
      uploaded_at: new Date(),
      upload_success: true,
    };
  } catch (err) {
    console.error("S3 upload error:", err);
    return {
      success: false,
      error: err.message,
      upload_success: false,
    };
  }
}

/**
 * Uploads all images (whole slide + cellavision) for a job to S3.
 * Updates the UploadMetadata document for each uploaded image.
 */
async function uploadImagesToS3(jobId) {
  const uploadMeta = await UploadMetadata.findOne({ job_id: jobId });
  if (!uploadMeta) throw new Error("Job metadata not found!");

  // WHOLE SLIDE
  const wsi = uploadMeta.whole_slide_image;
  const wsiPath = wsi.converted_to_tiff
    ? wsi.tiff_file_path
    : wsi.temp_file_path;
  const wsiFilename = path.basename(wsiPath);
  const wsiKey = `uploads/${jobId}/whole_slide/${wsiFilename}`;

  const wsiS3Meta = await uploadToS3(wsiPath, wsiKey);

  // Update DB for whole slide image
  await UploadMetadata.updateOne(
    { job_id: jobId },
    { $set: { "whole_slide_image.s3_storage": wsiS3Meta } }
  );
  console.log(`[${jobId}] Whole slide image uploaded to S3: ${wsiS3Meta}`);

  // CELLAVISION IMAGES
  let uploaded = wsiS3Meta.success ? 1 : 0;
  let failed = wsiS3Meta.success ? 0 : 1;
  let total = 1;

  if (uploadMeta.cellavision_images) {
    for (const [cellType, images] of uploadMeta.cellavision_images.entries()) {
      for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
        total += 1;
        const cellImage = images[imgIdx];
        const cellKey = `uploads/${jobId}/cellavision/${cellType}/${path.basename(
          cellImage.temp_file_path
        )}`;
        const cellS3Meta = await uploadToS3(cellImage.temp_file_path, cellKey);

        // Save in database
        images[imgIdx].s3_storage = cellS3Meta;
        if (cellS3Meta.success) uploaded += 1;
        else failed += 1;
      }
      // Ensure cellavision_images Map saved
      uploadMeta.cellavision_images.set(cellType, images);
    }
    await uploadMeta.save(); // Updates entire document
  }

  // Update summary
  await UploadMetadata.updateOne(
    { job_id: jobId },
    {
      $set: {
        status: uploaded === total ? "uploaded_to_s3" : "partially_uploaded",
        "s3_upload_summary.total_files": total,
        "s3_upload_summary.uploaded_files": uploaded,
        "s3_upload_summary.failed_files": failed,
        "s3_upload_summary.upload_completed_at": new Date(),
      },
    }
  );

  console.log(
    `[${jobId}] S3 uploads finished. Uploaded: ${uploaded}, Failed: ${failed}`
  );
  return {
    success: uploaded === total,
    uploaded,
    failed,
    total,
  };
}

// Export the main function
module.exports = {
  uploadImagesToS3,
  uploadToS3, 
};
