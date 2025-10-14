const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const UploadMetadata = require("../models/UploadMetadata.js");
const { sendJobToQueue } = require("../Kafka/KafkaClient");
const { randomUUID } = require("crypto");

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

    //get whole slide image
    const wholeSlide = req.files.find((f) => f.fieldname === "whole_slide");
   //allowed image types
    const allowedMimeTypes = ['image/tiff', 'image/jpeg', 'image/png', 'image/x-svs','image/jpg','application/octet-stream'];
    //check the format of the whole slide image
    if(wholeSlide){
      if (!allowedMimeTypes.includes(wholeSlide.mimetype)) {
        return res.status(400).json({ 
          message: "Invalid file type. Allowed: .tiff, .svs, .png, .jpg/.jpeg",
          receivedType: wholeSlide.mimetype 
        });
      }
    }
    
console.log("cellavision images.....")


// Validate cellavision image format for each file
// for (const image of cellavisionFiles) {
//   if (image.fieldname.startsWith("cellavision")) {
//     if (!allowedMimeTypes.includes(image.mimetype)) {
//       return res.status(400).json({ 
//         message: `Invalid cellavision file type: ${image.originalname}`,
//         receivedType: image.mimetype 
//       });
//     }
//   }
// }
// console.log("cellavision imagesprocessing")
// console.log("req.files:", req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname })));
// console.log("req.body keys:", Object.keys(req.body));
// console.log("req.body values:", Object.entries(req.body).filter(([key, value]) => key.includes('cell_type')));

    if (
      !common_name ||
      !user_email ||
      !approved 
    ) {
      return res.status(400).json({ message: "Missing required fields.Please fill all the required field" });
    }

    const job_id = uuidv4();
    //create job directory
    const jobDir = path.join(UPLOAD_ROOT, job_id);
    //create whole slide directory
    const slideDir = path.join(jobDir, "whole_slide");
    //create cellavision directory
    const cellavisionDir = path.join(jobDir, "cellavision");

    // Create folders for whole slide and cellavision
    await fs.mkdir(slideDir, { recursive: true });
    await fs.mkdir(cellavisionDir, { recursive: true });
    let slidePath = null;

    if(wholeSlide){
    // Save whole slide image
     slidePath = path.join(slideDir, wholeSlide.originalname);
    await fs.writeFile(slidePath, wholeSlide.buffer);
    }

    const cellavisionImages = {};
    const savedImagePaths = {
      whole_slide_image_path: slidePath,
      cellavision_image_paths: {},
    };

    //process cellavision images
    for (const image of req.files) {
      if (!image.fieldname.startsWith("cellavision")) continue;
     
      const match = image.fieldname.match(/^cellavision\[(\d+)\]$/);
      if (!match) continue;

      const index = parseInt(match[1]);
      
      // Handle both array format and indexed format
      let cellType;
      if (Array.isArray(req.body.cell_type)) {
        cellType = req.body.cell_type[index];
      } else {
        cellType = req.body[`cell_type[${index}]`];
      }
      
      console.log(`Index: ${index}, cellType: "${cellType}"`);
      if (!cellType) {
        console.log(`Skipping - no cell type for index ${index}`);
        continue;
      }

      // Create folder for each cell type if not exists
      const cellTypeDir = path.join(cellavisionDir, cellType);
      await fs.mkdir(cellTypeDir, { recursive: true });

      const savePath = path.join(cellTypeDir, image.originalname);
      await fs.writeFile(savePath, image.buffer);

      if (!cellavisionImages[cellType]) {
        cellavisionImages[cellType] = [];
        savedImagePaths.cellavision_image_paths[cellType] = [];
      }

      cellavisionImages[cellType].push({
        original_filename: image.originalname,
        mime_type: image.mimetype,
        size_bytes: image.size,
        temp_file_path: savePath,
      });

      savedImagePaths.cellavision_image_paths[cellType].push(savePath);
    }

    const response = {
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
      whole_slide_image: wholeSlide ? {
        original_filename: wholeSlide.originalname,
        mime_type: wholeSlide.mimetype,
        size_bytes: wholeSlide.size,
        temp_file_path: slidePath,
      }:null,
      cellavision_images: cellavisionImages,
      job_id,
      ...savedImagePaths, // contains full paths to saved files
    };

    console.log("response before the kafka",response)

    await UploadMetadata.create(response);
    await sendJobToQueue(response.job_id);
    console.log("Job sent to Kafka queue:", job_id);

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
