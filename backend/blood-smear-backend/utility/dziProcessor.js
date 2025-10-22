const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');
const AWS = require("@aws-sdk/client-s3");

// Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const S3_BUCKET_RAW = process.env.S3_BUCKET_RAW;


async function getFileStreamFromS3(s3Key) 
    {
        try{
            const params={
                Bucket: S3_BUCKET_RAW,
                Key: s3Key,
            };
            const s3Object=await s3.getObject(params).promise();
            return s3Object.Body;
        }catch(error){
            console.error(`Error getting file stream from S3: ${s3Key}`, error);
            throw error;
        }

    }
    async function checkIfTheImagesAreMultiSceneForWholeSlide(s3Key) {
        try {
            console.log(`🔍 Checking if image is multi-scene: ${s3Key}`);
            
            const fileStream = await getFileStreamFromS3(s3Key);
            
            // Get metadata from the image buffer
            const metadata = await sharp(fileStream).metadata();
            
            // Check for multiple scenes/pages
            const sceneCount = metadata.pages || metadata.nPages || 1;
            const isMultiScene = sceneCount > 1;
            
            console.log(`📊 Scene Analysis Results:`);
            console.log(`   - S3 Key: ${s3Key}`);
            console.log(`   - Scenes detected: ${sceneCount}`);
            console.log(`   - Is multi-scene: ${isMultiScene}`);
            console.log(`   - Dimensions: ${metadata.width}x${metadata.height}`);
            console.log(`   - Format: ${metadata.format}`);
            
            return {
                isMultiScene,
                sceneCount,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format,
                    pages: sceneCount,
                    channels: metadata.channels,
                    density: metadata.density
                }
            };
            
        } catch (error) {
            console.error(`❌ Error checking image scenes for ${s3Key}:`, error);
            throw new Error(`Failed to check image scenes: ${error.message}`);
        }
    }

    module.export ={checkIfTheImagesAreMultiSceneForWholeSlide,getFileStreamFromS3}