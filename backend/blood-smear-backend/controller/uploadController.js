const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const UploadMetadata = require("../models/UploadMetadata.js");
const { sendJobToQueue } = require("../Kafka/KafkaClient");

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

    let job_id;
    if (req.files && req.files.length > 0) {
      // Extract job_id from S3 key: uploads/{jobId}/whole_slide/filename
      const firstFile = req.files[0];
      const keyParts = firstFile.key.split('/');
      job_id = keyParts[1]; // uploads/{jobId}/whole_slide/filename
      console.log(`Extracted job_id from S3 key: ${job_id}`);
    } 
   
    const wholeSlide = req.files.find((f) => f.fieldname === "whole_slide");
    const cellavisionFiles = req.files.filter((f) => f.fieldname.startsWith("cellavision"));
    const cellTypes = req.body.cell_type || [];

    const allowedMimeTypes = ['image/tiff', 'image/jpeg', 'image/png', 'image/x-svs','image/jpg','application/octet-stream'];
    
    // Validate file types
    if(wholeSlide && !allowedMimeTypes.includes(wholeSlide.mimetype)) {
      return res.status(400).json({ 
        message: "Invalid file type. Allowed: .tiff, .svs, .png, .jpg/.jpeg",
        receivedType: wholeSlide.mimetype 
      });
    }

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
      status: "streamed_to_s3", 
      s3_upload_summary: {
        total_files: req.files.length,
        uploaded_files: req.files.length,
        failed_files: 0,
        upload_started_at: new Date(),
        upload_completed_at: new Date(),
        total_size_bytes: req.files.reduce((total, file) => total + (file.size || 0), 0)
      },
      cellavision_images: new Map()
    };
    
    // Process whole slide image (already uploaded to S3)
    if(wholeSlide) {
      uploadMetadata.whole_slide_image = {
        original_filename: wholeSlide.originalname,
        mime_type: wholeSlide.mimetype,
        size_bytes: wholeSlide.size || 0,
        s3_storage: {
          s3_url: wholeSlide.location, // multer-s3 provides 'location'
          s3_key: wholeSlide.key, // multer-s3 provides 'key'
          s3_etag: wholeSlide.etag, // multer-s3 provides 'etag'
          s3_bucket: wholeSlide.bucket, // multer-s3 provides 'bucket'
          uploaded_at: new Date(),
          upload_success: true,
          bucket_type: 'raw'
        }
      };
    }

    // creating metadata for cellavision images
    if (cellavisionFiles.length > 0) {
      console.log("Processing cellavision images:", cellavisionFiles.length);
      
      for(let i = 0; i < cellavisionFiles.length; i++){
        const cellavisionFile = cellavisionFiles[i];
        
        // Extract cell type from S3 key: uploads/{jobId}/cellavision/{cellType}/{filename}
        let cellType = "Unknown";
        if (cellavisionFile.key) {
          const keyParts = cellavisionFile.key.split('/');
          if (keyParts.length >= 4 && keyParts[2] === 'cellavision') {
            cellType = keyParts[3]; // Extract cell type from S3 key
          }
        }
        console.log(`[${job_id}] Cellavision image: ${cellavisionFile.originalname}, Cell Type: ${cellType}`);
        
        const cellavisionImageData = {
          original_filename: cellavisionFile.originalname,
          mime_type: cellavisionFile.mimetype,
          size_bytes: cellavisionFile.size || 0,
          s3_storage: {
            s3_url: cellavisionFile.location,
            s3_key: cellavisionFile.key,
            s3_etag: cellavisionFile.etag,
            s3_bucket: cellavisionFile.bucket,
            uploaded_at: new Date(),
            upload_success: true,
            bucket_type: 'raw'
          }
        };
        
        // Add to cellavision_images Map
        if (!uploadMetadata.cellavision_images.has(cellType)) {
          uploadMetadata.cellavision_images.set(cellType, []);
        }
        uploadMetadata.cellavision_images.get(cellType).push(cellavisionImageData);
      }
    }
   
    // Save metadata to database
    await UploadMetadata.create(uploadMetadata);
    
    
    // Send job to queue for processing
    await sendJobToQueue(job_id);
    console.log("Job sent to queue for processing:", job_id);
   
    res.status(200).json({
      status: "received",
      message: "Upload received and will be processed.",
      job_id: job_id
    });
    
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};