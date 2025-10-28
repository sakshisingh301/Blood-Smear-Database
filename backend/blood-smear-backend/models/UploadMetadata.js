const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// S3 Storage Schema - Reusable for any image
const S3StorageSchema = new mongoose.Schema(
  {
    s3_url: { type: String, default: null },
    s3_key: { type: String, default: null },
    s3_etag: { type: String, default: null },
    s3_bucket: { type: String, default: null },
    cloudfront_url: { type: String, default: null }, 
    uploaded_at: { type: Date, default: null },
    upload_success: { type: Boolean, default: false },
    bucket_type:{type: String, enum: ['raw', 'processed'],default: 'raw'},
  },
  { _id: false }
);
// Whole Slide Image Schema
const WholeSlideImageSchema = new mongoose.Schema(
  {
    original_filename: { type: String, required: true },
    mime_type: { type: String, required: true },
    size_bytes: { type: Number, required: true },
    is_image_corrupted: { type: Boolean, default: false },
   
    // S3 Storage Information
    s3_storage: { type: S3StorageSchema, default: null },
  },
  { _id: false }
);

// Whole Slide Image Schema
const WholeSlideDziSchema = new mongoose.Schema(
  {
    // Scene identification (for multi-scene images)
    scene_number: { type: Number, default: 0 },
    scene_name: { type: String, default: "scene0" },
    z_level: { type: Number, default: 0 }, // Z-stack level
    channel: { type: Number, default: 0 }, // Color channel
    
    // Main DZI URL (what frontend needs)
    dzi_url: { type: String, required: true },
    
    // DZI Pyramid Information
    pyramid_levels: { type: Number, required: true },
    tile_count: { type: Number, required: true },
    tile_size: { type: Number, default: 256 },
    tile_format: { type: String, default: 'jpeg' },
    tile_overlap: { type: Number, default: 0 },
    
    // Original Image Dimensions
    image_width: { type: Number, required: true },
    image_height: { type: Number, required: true },
    
    // S3 Storage Information for DZI file
    s3_dzi_key: { type: String, required: true }, // S3 key for the .dzi file
    s3_tiles_prefix: { type: String, required: true }, // Base path for tiles
    s3_bucket: { type: String, default: process.env.S3_BUCKET_RAW },
    
    // Processing Metadata
    processing_status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'completed'
    },
    processing_time_ms: { type: Number, default: 0 },
    processed_at: { type: Date, default: Date.now },
    
    // Error tracking
    error_message: { type: String, default: null }
  },
  { _id: false, timestamps: true }
);

// Cellavision Image Schema
const CellavisionImageSchema = new mongoose.Schema(
  {
    original_filename: { type: String, required: true },
    mime_type: { type: String, required: true },
    size_bytes: { type: Number, required: true },
    is_image_corrupted: { type: Boolean, default: false },

    // S3 Storage Information
    s3_storage: { type: S3StorageSchema, default: null },
  },
  { _id: false }
);





const CellavisionDziSchema = new mongoose.Schema(
  {
    cell_filename: String,
    cell_type: String,
    dzi_url: String,
    tile_size: { type: Number, default: 256 },
  },
  { _id: false }
);

// Main Upload Schema
const UploadSchema = new mongoose.Schema({
  // Basic metadata
  common_name: { type: String, required: true },
  scientific_name: { type: String, required: true },
  taxonomy: { type: Object, required: true },
  health_status: { type: String, required: true },
  custom_health_status: { type: String },
  stain: { type: String, required: true },
  custom_stain: { type: String },
  sex: { type: String },
  age: {
    years: { type: Number },
    months: { type: Number },
    days: { type: Number }
  },
  scanner_type: { type: String },
  custom_scanner_type: { type: String },
  magnification: { type: String },
  contributor: { type: String, required: true },
  collected_at: { type: Date, required: true },
  source: { type: String, required: true },
  approved: { type: Boolean, default: false },

  // User information
  user_name: { type: String },
  user_email: { type: String },
  user_role: { type: String },
  // Image data with S3 integration
  whole_slide_image: WholeSlideImageSchema,

  cellavision_images: {
    type: Map,
    of: [CellavisionImageSchema],
  },
  dzi_outputs: {
    whole_slide: [WholeSlideDziSchema], // Multi-scene slide results
    cellavision: {
      type: Map,
      of: [CellavisionDziSchema], // One per cell type (e.g., Neutrophil, Lymphocyte)
    },
    
  },


  // Job and user tracking
  user_id: {
    type: String,
    default: uuidv4,
    index: true,
  },
  job_id: { type: String, required: true, unique: true },

  // Status tracking
  status: {
    type: String,
    default: "streaming_to_s3",
    enum: [
      "streaming_to_s3",           // 1Initial upload streaming to S3
      "streamed_to_s3",           // Successfully streamed to raw-bucket           //  ClamAV scanning in progress
      "virus_clean",              //  Virus scan passed
      "virus_infected",           // Virus scan failed
      "processing_scenes",        // libvips processing scenes/channels
      "generating_tiles",         //  Converting to .dzi tiles
      "uploading_tiles",          //  Uploading tiles to processed-bucket
      "ready_for_viewer",         // Ready for OpenSeadragon viewer
      "failed",                   //  Any stage failed
      "partially_processed", 
    ],
  },

  // S3 Upload Summary
  s3_upload_summary: {
    total_files: { type: Number, default: 0 },
    uploaded_files: { type: Number, default: 0 },
    failed_files: { type: Number, default: 0 },
    upload_started_at: { type: Date, default: null },
    upload_completed_at: { type: Date, default: null },
    total_size_bytes: { type: Number, default: 0 },
  },

  // Error tracking
  error_message: String,
  is_image_corrupted: { type: Boolean, default: false },

  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  
});

// Update the updated_at field before saving
UploadSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

UploadSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updated_at: new Date() });
  next();
});

// Useful methods for S3 operations
UploadSchema.methods.getWholeSlideS3Url = function () {
  return this.whole_slide_image?.s3_storage?.s3_url || null;
};

UploadSchema.methods.getCellavisionS3Urls = function () {
  const urls = {};
  if (this.cellavision_images) {
    for (const [cellType, images] of this.cellavision_images.entries()) {
      urls[cellType] = images
        .map((img) => img.s3_storage?.s3_url)
        .filter(Boolean);
    }
  }
  return urls;
};

UploadSchema.methods.getAllS3Urls = function () {
  const urls = [];

  // Add whole slide URL
  const wholeSlideUrl = this.getWholeSlideS3Url();
  if (wholeSlideUrl) urls.push(wholeSlideUrl);

  // Add cellavision URLs
  const cellavisionUrls = this.getCellavisionS3Urls();
  for (const cellTypeUrls of Object.values(cellavisionUrls)) {
    urls.push(...cellTypeUrls);
  }

  return urls;
};

UploadSchema.methods.isFullyUploadedToS3 = function () {
  const wholeSlideUploaded = this.whole_slide_image?.s3_storage?.upload_success;

  let allCellavisionUploaded = true;
  if (this.cellavision_images) {
    for (const [cellType, images] of this.cellavision_images.entries()) {
      for (const image of images) {
        if (!image.s3_storage?.upload_success) {
          allCellavisionUploaded = false;
          break;
        }
      }
      if (!allCellavisionUploaded) break;
    }
  }

  return wholeSlideUploaded && allCellavisionUploaded;
};

module.exports = mongoose.model("UploadMetadata", UploadSchema);
