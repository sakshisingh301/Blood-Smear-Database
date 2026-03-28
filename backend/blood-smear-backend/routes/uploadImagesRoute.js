const express = require("express");
const { randomUUID } = require("crypto");

const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const uploadController = require("../controller/uploadController.js");

const router = express.Router();

// Configure AWS SDK globally (required by multer-s3)
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Create S3 instance
const s3 = new AWS.S3();

// Configure multer to stream directly to S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_RAW,
        key: function (req, file, cb) {
            if (!req.jobId) {
                req.jobId = req.body.job_id || randomUUID();
                console.log(`Generated job ID: ${req.jobId}`);
            }
            
            if (file.fieldname === "whole_slide") {
                cb(null, `uploads/${req.jobId}/whole_slide/${file.originalname}`);
            } else if (file.fieldname.startsWith("cellavision")) {
                let cellType = 'unknown';
                
                // Handle underscore format: cellavision_Neutrophil
                if (file.fieldname.includes('_')) {
                    cellType = file.fieldname.split('_')[1];
                    console.log(`File: ${file.fieldname}, CellType: ${cellType}`);
                } else if (file.fieldname.includes('[')) {
                    // Handle array format: cellavision[0] (fallback)
                    const match = file.fieldname.match(/cellavision\[(\d+)\]/);
                    const index = match ? match[1] : '0';
                    const cellTypes = req.body.cell_type || [];
                    cellType = cellTypes[index] || `cell_${index}`;
                    console.log(`File: ${file.fieldname}, Index: ${index}, CellType: ${cellType}`);
                }
                
                cb(null, `uploads/${req.jobId}/cellavision/${cellType}/${file.originalname}`);
            }
        },
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname,
                originalName: file.originalname,
                uploadedAt: new Date().toISOString(),
                jobId: req.jobId
            });
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // acl: 'private',
        // partSize: 10 * 1024 * 1024,
        // queueSize: 10
    }),
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB per file
        files: 20,
        fieldSize: 10 * 1024 * 1024
    }
});

router.post("/upload/admin", (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            console.error("❌ Multer/S3 Upload Error:", err);
            return res.status(500).json({ message: "File upload failed", error: err.message });
        }
        if (!req.files || req.files.length === 0) {
            console.error("❌ No files uploaded. req.files:", req.files);
            return res.status(400).json({ message: "No files received" });
        }
        console.log(`✅ ${req.files.length} files uploaded to S3`);
        next();
    });
}, uploadController.uploadImage);
module.exports = router;