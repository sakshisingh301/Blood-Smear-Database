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

    const wholeSlide = req.files.find((f) => f.fieldname === "whole_slide");
    console.log(wholeSlide)
   
    const allowedMimeTypes = ['image/tiff', 'image/jpeg', 'image/png', 'image/x-svs','image/jpg','application/octet-stream'];
    if(wholeSlide){
      if (!allowedMimeTypes.includes(wholeSlide.mimetype)) {
        return res.status(400).json({ 
          message: "Invalid file type. Allowed: .tiff, .svs, .png, .jpg/.jpeg",
          receivedType: wholeSlide.mimetype 
        });
      }
    }
    
console.log("cellavision images.....")


// Validate cellavision images
for (const image of req.files) {
  if (image.fieldname.startsWith("cellavision")) {
    if (!allowedMimeTypes.includes(image.mimetype)) {
      return res.status(400).json({ 
        message: `Invalid cellavision file type: ${image.originalname}`,
        receivedType: image.mimetype 
      });
    }
  }
}
console.log("cellavision imagesprocessing")

    if (
      !common_name ||
      !user_email ||
      !health_status ||
      !approved 
    ) {
      return res.status(400).json({ message: "Missing required fields.Please fill all the required field" });
    }

    const job_id = uuidv4();
    const jobDir = path.join(UPLOAD_ROOT, job_id);
    const slideDir = path.join(jobDir, "whole_slide");
    const cellavisionDir = path.join(jobDir, "cellavision");

    // Create folders
    await fs.mkdir(slideDir, { recursive: true });
    await fs.mkdir(cellavisionDir, { recursive: true });

    // Save whole slide image
    const slidePath = path.join(slideDir, wholeSlide.originalname);
    await fs.writeFile(slidePath, wholeSlide.buffer);

    const cellavisionImages = {};
    const savedImagePaths = {
      whole_slide_image_path: slidePath,
      cellavision_image_paths: {},
    };

    for (const image of req.files) {
      if (!image.fieldname.startsWith("cellavision")) continue;

      const match = image.fieldname.match(/^cellavision\[(\d+)\]$/);
      if (!match) continue;

      const index = parseInt(match[1]);
      const cellType = req.body.cell_type[index];
      if (!cellType) continue;

      // Create folder for cell type if not exists
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
      whole_slide_image: {
        original_filename: wholeSlide.originalname,
        mime_type: wholeSlide.mimetype,
        size_bytes: wholeSlide.size,
        temp_file_path: slidePath,
      },
      cellavision_images: cellavisionImages,
      job_id,
      ...savedImagePaths, // contains full paths to saved files
    };

    await UploadMetadata.create(response);
    await sendJobToQueue(response);
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
