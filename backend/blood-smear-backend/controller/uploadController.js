const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const UploadMetadata = require("../models/UploadMetadata.js");
const { sendJobToQueue } = require("../Kafka/KafkaClient");
const { randomUUID } = require("crypto");
const { streamToRawBucket, generateS3Key } = require("../utility/S3Upload");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

exports.uploadImage = async (req, res) => {
  try {
    const metadata = JSON.parse(req.body.metadata || "{}");
  
    const {
      common_name,
      scientific_name,
      taxonomy,
      user_id,
      user_name,
      user_email,
      health_status,
      custom_health_status,
      stain,
      custom_stain,
      sex,
      age,
      scanner_type,
      custom_scanner_type,
      magnification,
      contributor,
      collected_at,
      source,
      approved,
      user_role,
    } = metadata;

    const job_id = randomUUID();
   
    const wholeSlide = req.files.find((f) => f.fieldname === "whole_slide");
 
    const allowedMimeTypes = ['image/tiff', 'image/jpeg', 'image/png', 'image/x-svs','image/jpg','application/octet-stream'];
    
    // Check the format of the whole slide image
    if(wholeSlide){
      if (!allowedMimeTypes.includes(wholeSlide.mimetype)) {
        return res.status(400).json({ 
          message: "Invalid file type. Allowed: .tiff, .svs, .png, .jpg/.jpeg",
          receivedType: wholeSlide.mimetype 
        });
      }
    }
    
    let fullSlideStream = null;
    if(wholeSlide){
      const s3Key = generateS3Key(job_id, wholeSlide.originalname, "whole_slide");
      fullSlideStream = await streamToRawBucket(wholeSlide.buffer, s3Key, wholeSlide.originalname, wholeSlide.mimetype);
      if(!fullSlideStream.success){
        return res.status(500).json({
          message: "Failed to upload the whole slide image to the raw bucket",
          error: fullSlideStream.error
        });
      }
    }
    
    const cellavisionFiles = req.files.filter((f) => f.fieldname.startsWith("cellavision"));
    const cellTypes = req.body.cell_type || [];
    let cellavisionUploadResults = []; // Array to store all upload results
   
    if(cellavisionFiles.length > 0){
      console.log("Processing cellavision images:", cellavisionFiles.length);
      
      // Validate that cellTypes array matches cellavisionFiles length
      if (cellTypes.length !== cellavisionFiles.length) {
        console.warn(`Mismatch: ${cellavisionFiles.length} cellavision files but ${cellTypes.length} cell types provided`);
      }
      
      for(let i = 0; i < cellavisionFiles.length; i++){
        const cellavisionFile = cellavisionFiles[i];
        const cellType = cellTypes[i] || "Unknown";
        
        const s3Key = generateS3Key(job_id, cellavisionFile.originalname, "cellavision", cellType);
        console.log(`Uploading ${cellType} image:`, s3Key);
        
        const uploadResult = await streamToRawBucket(
          cellavisionFile.buffer, 
          s3Key, 
          cellavisionFile.originalname, 
          cellavisionFile.mimetype
        );
        
        // Store the result with file and cell type info
        cellavisionUploadResults.push({
          file: cellavisionFile,
          cellType: cellType,
          uploadResult: uploadResult
        });
      }
    }
    
    console.log("cellavisionUploadResults----->:", cellavisionUploadResults);
    
    const uploadMetadata = {
      job_id,
      common_name,
      scientific_name,
      taxonomy,
      user_id,
      user_name,
      user_email,
      health_status,
      custom_health_status,
      stain,
      custom_stain,
      sex,
      age,
      scanner_type,
      custom_scanner_type,
      magnification,
      contributor,
      collected_at: new Date(collected_at),
      source,
      approved,
      user_role,
      status: "streaming_to_s3",
      s3_upload_summary: {
        total_files: (wholeSlide ? 1 : 0) + cellavisionFiles.length,
        uploaded_files: 0, // Will be updated after successful uploads
        failed_files: 0,
        upload_started_at: new Date(),
        total_size_bytes: 0
      },
      // Initialize cellavision_images as a Map
      cellavision_images: new Map()
    };
    
    if(wholeSlide) {
      uploadMetadata.whole_slide_image = {
        original_filename: wholeSlide.originalname,
        mime_type: wholeSlide.mimetype,
        size_bytes: wholeSlide.size,
        s3_storage: {
          s3_url: fullSlideStream.s3_url,
          s3_key: fullSlideStream.s3_key,
          s3_etag: fullSlideStream.s3_etag,
          s3_bucket: fullSlideStream.s3_bucket,
          cloudfront_url: fullSlideStream.cloudfront_url,
          uploaded_at: fullSlideStream.uploaded_at,
          upload_success: fullSlideStream.upload_success,
          bucket_type: 'raw',
        }
      };
      uploadMetadata.s3_upload_summary.uploaded_files += 1;
      uploadMetadata.s3_upload_summary.total_size_bytes += wholeSlide.size;
    }

    // Process cellavision upload results
    if (cellavisionUploadResults.length > 0) {
      for (const { file: cellavisionFile, cellType, uploadResult } of cellavisionUploadResults) {
        if (uploadResult.success) {
          const cellavisionImageData = {
            original_filename: cellavisionFile.originalname,
            mime_type: cellavisionFile.mimetype,
            size_bytes: cellavisionFile.size,
            s3_storage: {
              s3_url: uploadResult.s3_url,
              s3_key: uploadResult.s3_key,
              s3_etag: uploadResult.s3_etag,
              s3_bucket: uploadResult.s3_bucket,
              cloudfront_url: uploadResult.cloudfront_url,
              uploaded_at: uploadResult.uploaded_at,
              upload_success: uploadResult.upload_success,
              bucket_type: 'raw'
            }
          };
          
          // Add to cellavision_images Map
          if (!uploadMetadata.cellavision_images.has(cellType)) {
            uploadMetadata.cellavision_images.set(cellType, []);
          }
          uploadMetadata.cellavision_images.get(cellType).push(cellavisionImageData);
          
          uploadMetadata.s3_upload_summary.uploaded_files += 1;
          uploadMetadata.s3_upload_summary.total_size_bytes += cellavisionFile.size;
        } else {
          uploadMetadata.s3_upload_summary.failed_files += 1;
          console.error(`Failed to upload cellavision file ${cellavisionFile.originalname}:`, uploadResult.error);
        }
      }
    }
     // Update status to "streamed_to_s3" if all uploads were successful
     if (uploadMetadata.s3_upload_summary.failed_files === 0 && uploadMetadata.s3_upload_summary.uploaded_files > 0) {
      uploadMetadata.status = "streamed_to_s3";
      uploadMetadata.s3_upload_summary.upload_completed_at = new Date();
    } else if (uploadMetadata.s3_upload_summary.failed_files > 0) {
      uploadMetadata.status = "failed";
      uploadMetadata.error_message = "Some files failed to upload to S3";
    }
    
    
    await UploadMetadata.create(uploadMetadata);
    await sendJobToQueue(job_id);
   
    res.status(200).json({
      status: "received",
      message: "Upload received and will be processed.",
      job_id,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};