const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// S3 Storage Schema - Reusable for any image
const S3StorageSchema = new mongoose.Schema(
  {
    s3_url: { type: String, default: null },
    s3_key: { type: String, default: null },
    s3_etag: { type: String, default: null },
    s3_bucket: { type: String, default: null },
    cloudfront_url: { type: String, default: null }, // For CDN access
    uploaded_at: { type: Date, default: null },
    upload_success: { type: Boolean, default: false },
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
    temp_file_path: { type: String, required: true },
    converted_to_tiff: { type: Boolean, default: false },
    tiff_file_path: { type: String, default: null },

    // S3 Storage Information
    s3_storage: { type: S3StorageSchema, default: null },
  },
  { _id: false }
);

// Cellavision Image Schema
const CellavisionImageSchema = new mongoose.Schema(
  {
    original_filename: { type: String, required: true },
    mime_type: { type: String, required: true },
    size_bytes: { type: Number, required: true },
    is_image_corrupted: { type: Boolean, default: false },
    temp_file_path: { type: String, required: true },

    // S3 Storage Information
    s3_storage: { type: S3StorageSchema, default: null },
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
    default: "processing",
    enum: [
      "processing",
      "clean",
      "failed",
      "uploading_to_s3",
      "uploaded_to_s3",
      "ready_for_access",
      "partially_uploaded",
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

  // Legacy field (kept for backward compatibility)
  image_urls: [String], // Deprecated - use s3_storage.s3_url instead
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
