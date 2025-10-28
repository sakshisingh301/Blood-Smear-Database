const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');
const AWS = require("@aws-sdk/client-s3");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const CLOUD_FRONT_DOMAIN = process.env.CLOUD_FRONT_DOMAIN ;
// Add this new line after line 6
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, '..');

// Initialize S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const S3_BUCKET_RAW = process.env.S3_BUCKET_RAW;

//stream full slide image to local temp file
//from temp file check if the image is multi scene
//If single scene, then convert the image to dzi
//delete the temp file

//takes the full slide images from s3 and save it in temp folder /temp_dzi/input_1234567890_image.tif
//S3 sends → chunk 1 → write to disk
// S3 sends → chunk 2 → write to disk
// S3 sends → chunk 3 → write to disk
// ... continues until complete
async function streamFullSlideImageToLocalTempFile(s3Key) {
    console.log("📥 Streaming from S3 to local temp file");

    const localPath = path.join(STORAGE_PATH, 'temp_dzi', `input_${Date.now()}_${path.basename(s3Key)}`);
    
    
    try {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_RAW,
        Key: s3Key
      });
  
      const response = await s3.send(command);
      //create the directory if it doesn't exist
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      //write the images to this local path (/temp_dzi/input_1234567890_image.tif)
      const writeStream = require('fs').createWriteStream(localPath);

  //once all the chunks are written to the disk, Nodejs stream will return a finish event and the promise is resolved
  //else if there is an error, the promise is rejected
      await new Promise((resolve, reject) => {
          response.Body.pipe(writeStream)
              .on('finish', () => {
                  console.log(`✅ Downloaded to disk: ${localPath}`);
                  resolve();
              })
              .on('error', reject);
      });
      
      return localPath;  // path of the local file where input image is saved
      
    } catch (error) {
      // ✅ DELETE file on error!
      console.error(`Download failed for the whole slide image:`, error.message);
      try {
        await fs.unlink(localPath);
        console.log(`🧹 Cleaned up failed download`);
      } catch (e) {
        // Ignore if file doesn't exist
      }
      throw error;
    }
  }


async function checkIfTheImagesAreMultiSceneForWholeSlide(localPath) {
  console.log(`🔍 Checking scene count...`);
    
  const metadata = await sharp(localPath, {
      limitInputPixels: false
  }).metadata();
  
  const sceneCount = metadata.pages || 1;
  console.log(`   Scenes: ${sceneCount}`);
  
  return {
      isMultiScene: sceneCount > 1,
      sceneCount: sceneCount,
      width: metadata.width,
      height: metadata.height
  };

}

// STEP 3: Convert to DZI and upload to S3 (RAW BUCKET)
async function convertToDZI(localInputPath, s3Key,job_id) {
  console.log(`⚙️ Converting to DZI...`);
  
  // Create temp output directory
  const dziId = path.parse(s3Key).name;
//output directory is /temp_dzi/output_full_slide_1234567890
const outputDir = path.join(STORAGE_PATH, 'temp_dzi', `output_full_slide_${Date.now()}`);

  const dziPath = path.join(outputDir, 'scene0_z0_c0');
  
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate DZI tiles
  const tileInfo = await sharp(localInputPath, {
      limitInputPixels: false
  })
  .tile({
      size: 256,
      layout: 'dz',
      overlap: 0
  })
  .toFile(dziPath);
  
  // Upload .dzi file to RAW bucket
  const dziFileBuffer = await fs.readFile(`${dziPath}.dzi`);
  const dziS3Key = `uploads/${job_id}/full_slide_dzi/${dziId}/scene0_z0_c0.dzi`;
  
  await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET_RAW, 
      Key: dziS3Key,
      Body: dziFileBuffer,
      ContentType: 'application/xml'
  }));
  
  console.log(`☁️ Uploading tiles to raw bucket...`);
  
  // Upload all tiles to RAW bucket with parallel processing
  const tilesDir = `${dziPath}_files`;
  const levels = await fs.readdir(tilesDir);
  
  console.log(`✅ DZI generated with ${levels.length} pyramid levels`);
  
  // Collect all upload tasks
  const uploadTasks = [];
  
  for (const level of levels) {
      const levelPath = path.join(tilesDir, level);
      
      // Check if it's a directory (skip vips-properties.xml and other files)
      const stat = await fs.stat(levelPath);
      if (!stat.isDirectory()) {
          continue; // Skip files, only process directories
      }
      
      const tiles = await fs.readdir(levelPath);
      
      for (const tile of tiles) {
          // Create upload task but don't await yet
          const uploadTask = async () => {
              const tileBuffer = await fs.readFile(path.join(levelPath, tile));
              const tileS3Key = `processed/${dziId}/scene0_z0_c0_files/${level}/${tile}`;
              
              await s3.send(new PutObjectCommand({
                  Bucket: S3_BUCKET_RAW,  
                  Key: tileS3Key,
                  Body: tileBuffer,
                  ContentType: 'image/jpeg'
              }));
          };
          
          uploadTasks.push({ level, task: uploadTask });
      }
  }
  
  console.log(`   Total tiles to upload: ${uploadTasks.length}`);
  
  // Upload in batches of 50 for controlled concurrency
  const BATCH_SIZE = 50;
  let tileCount = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < uploadTasks.length; i += BATCH_SIZE) {
      const batch = uploadTasks.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(({ task }) => task()));
      tileCount += batch.length;
      
      const progress = Math.round((tileCount / uploadTasks.length) * 100);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = Math.round(tileCount / (elapsed || 1));
      console.log(`   📤 Progress: ${tileCount}/${uploadTasks.length} tiles (${progress}%) | ${rate} tiles/sec | ${elapsed}s elapsed`);
  }
  
  // Cleanup temp files
  await fs.rm(outputDir, { recursive: true });
  console.log(`✅ Uploaded ${tileCount} tiles to raw bucket`);
  
  return {
      dzi_url: `${CLOUD_FRONT_DOMAIN}/${dziS3Key}`,  // CloudFront still works if configured for raw bucket
      pyramid_levels: levels.length,
      tile_count: tileCount
  };
}


    module.exports ={checkIfTheImagesAreMultiSceneForWholeSlide,convertToDZI,streamFullSlideImageToLocalTempFile}