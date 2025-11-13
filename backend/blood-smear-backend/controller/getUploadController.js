//get api by job id
//get api by email id
const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const UploadMetadata = require("../models/UploadMetadata.js");
const { sendJobToQueue } = require("../Kafka/KafkaClient");
const { randomUUID } = require("crypto");

exports.getUploadImage = async (req, res) => {
    try {
        const { job_id } = req.params;
    
        if (!job_id) {
          return res.status(400).json({
            success: false,
            message: "Job ID is required"
          });
        }
    
        const upload = await UploadMetadata.findOne({ job_id });
    
        if (!upload) {
          return res.status(404).json({
            success: false,
            message: "Upload not found with the provided job ID"
          });
        }
    
        // Transform cellavision images for better response
        const cellavisionInfo = {};
        if (upload.cellavision_images) {
          for (const [cellType, images] of upload.cellavision_images.entries()) {
            cellavisionInfo[cellType] = images.map(img => ({
              original_filename: img.original_filename,
              mime_type: img.mime_type,
              size_bytes: img.size_bytes,
              is_image_corrupted: img.is_image_corrupted,
              s3_storage: img.s3_storage
            }));
          }
        }
    
        const response = {
          id: upload._id,
          job_id: upload.job_id,
          common_name: upload.common_name,
          scientific_name: upload.scientific_name,
          taxonomy: upload.taxonomy,
          health_status: upload.health_status,
          custom_health_status: upload.custom_health_status,
          stain: upload.stain,
          custom_stain: upload.custom_stain,
          sex: upload.sex,
          age: upload.age,
          scanner_type: upload.scanner_type,
          custom_scanner_type: upload.custom_scanner_type,
          magnification: upload.magnification,
          contributor: upload.contributor,
          collected_at: upload.collected_at,
          source: upload.source,
          approved: upload.approved,
          user_email: upload.user_email,
          user_name: upload.user_name,
          user_role: upload.user_role,
          status: upload.status,
          created_at: upload.created_at,
          updated_at: upload.updated_at,
          error_message: upload.error_message,
          is_image_corrupted: upload.is_image_corrupted,
          s3_upload_summary: upload.s3_upload_summary,
          whole_slide_image: upload.whole_slide_image,
          cellavision_images: cellavisionInfo,
          dzi_outputs: upload.dzi_outputs
        
        };
    
        res.status(200).json({
          success: true,
          data: response
        });
      } catch (err) {
        console.error("Failed to fetch upload by job_id:", err);
        res.status(500).json({ 
          success: false,
          message: "Internal server error" 
        });
      }
};

exports.getUploadsByEmail = async (req, res) => {
    try {
      const { email } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }
  
      // Get uploads by email with pagination
      const uploads = await UploadMetadata.find({ user_email: email })
        .select(`
          job_id
          common_name
          scientific_name
          health_status
          stain
          contributor
          collected_at
          source
          status
          user_email
          user_name
          created_at
          updated_at
          s3_upload_summary
          whole_slide_image.original_filename
          whole_slide_image.s3_storage.s3_url
          whole_slide_image.s3_storage.cloudfront_url
          whole_slide_image.s3_storage.upload_success
          cellavision_images
          error_message
        `)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
  
      // Get total count for pagination
      const total = await UploadMetadata.countDocuments({ user_email: email });
  
      // Transform the data to include cellavision image info
      const transformedUploads = uploads.map(upload => {
        const cellavisionInfo = {};
        if (upload.cellavision_images) {
          for (const [cellType, images] of upload.cellavision_images.entries()) {
            cellavisionInfo[cellType] = images.map(img => ({
              original_filename: img.original_filename,
              s3_url: img.s3_storage?.s3_url || null,
              cloudfront_url: img.s3_storage?.cloudfront_url || null,
              upload_success: img.s3_storage?.upload_success || false
            }));
          }
        }
  
        return {
          id: upload._id,
          job_id: upload.job_id,
          common_name: upload.common_name,
          scientific_name: upload.scientific_name,
          health_status: upload.health_status,
          stain: upload.stain,
          contributor: upload.contributor,
          collected_at: upload.collected_at,
          source: upload.source,
          status: upload.status,
          user_email: upload.user_email,
          user_name: upload.user_name,
          created_at: upload.created_at,
          updated_at: upload.updated_at,
          error_message: upload.error_message,
          s3_upload_summary: upload.s3_upload_summary,
          whole_slide_image: {
            original_filename: upload.whole_slide_image?.original_filename,
            s3_url: upload.whole_slide_image?.s3_storage?.s3_url || null,
            cloudfront_url: upload.whole_slide_image?.s3_storage?.cloudfront_url || null,
            upload_success: upload.whole_slide_image?.s3_storage?.upload_success || false
          },
          cellavision_images: cellavisionInfo
        };
      });
  
      res.status(200).json({
        success: true,
        data: transformedUploads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      console.error("Failed to fetch uploads by email:", err);
      res.status(500).json({ 
        success: false,
        message: "Internal server error" 
      });
    }
  };
