# Admin Upload Page - Blood Smear Database

## Overview
The Admin Upload Page is a specialized interface designed for UC Davis authorized administrators to upload blood smear images and metadata to the Blood Smear Database.

## Access
- **URL**: `/admin/upload`
- **Navigation**: Admin → Image Upload (in navbar)
- **Homepage**: Access Admin Panel button in the Admin Section

## Features

### 1. Upload Type Selection
- **Full Slide Image**: Upload a single high-resolution slide image
- **Cellavision Images**: Upload multiple images organized by cell types

### 2. Full Slide Upload
- Supports formats: TIFF, VSI, NDPI, SVS
- Single image upload per submission
- Ideal for whole slide scanning systems

### 3. Cellavision Upload
- Multiple cell types with predefined categories:
  - Neutrophil
  - Lymphocyte
  - Monocyte
  - Eosinophil
  - Basophil
  - Platelet
  - Red Blood Cell
- Custom cell type addition capability
- **Minimum 20 images per cell type required**
- Supports formats: JPG, PNG, TIFF

### 4. Metadata Fields

#### Required Fields (*)
- **Common Name**: e.g., "Somali Ostrich"
- **Scientific Name**: e.g., "Struthio molybdophanes"
- **Contributor**: e.g., "Dr. Hugues"
- **Collection Date**: Date specimen was collected
- **Source**: e.g., "Primate Center"

#### Optional Fields
- **Order**: Taxonomic order
- **Family**: Taxonomic family
- **Group**: General classification (e.g., "Bird")
- **Health Status**: Clinically Healthy, Diseased, Unknown
- **Stain Type**: Wright-Giemsa, Diff-Quik, May-Grünwald-Giemsa, Other

## Usage Instructions

### For Full Slide Images:
1. Select "Full Slide Image" upload type
2. Fill in required metadata fields
3. Upload the slide image file
4. Click "Upload Images & Metadata"

### For Cellavision Images:
1. Select "Cellavision Images" upload type
2. Fill in required metadata fields
3. For each cell type, upload initial batch of images
4. Use "+ Add More Images" button to incrementally add more images
5. Continue until minimum 20 images per cell type is met
6. Add custom cell types if needed
7. Click "Upload Images & Metadata"

## File Requirements

### Full Slide Images:
- **Formats**: TIFF, VSI, NDPI, SVS
- **Size**: No specific limit (handled by backend)
- **Quality**: High-resolution recommended

### Cellavision Images:
- **Formats**: JPG, PNG, TIFF
- **Quantity**: Minimum 20 images per cell type required
- **Size**: Individual file size handled by backend

## Security & Access Control
- **Authentication**: Requires UC Davis admin credentials
- **Authorization**: Restricted to authorized personnel only
- **Audit Trail**: All uploads are logged and tracked

## Integration Notes
- **Backend API**: Currently configured for `/api/admin/upload` endpoint
- **File Handling**: Uses FormData for multipart file uploads
- **Metadata**: Structured JSON format for database storage
- **Error Handling**: Comprehensive client-side validation

## Technical Details

### Frontend Components:
- `AdminUploadPage.jsx`: Main component
- `AdminUploadPage.css`: Styling
- Route: `/admin/upload`

### State Management:
- Form data validation
- File upload handling
- Error state management
- Loading states during submission

### Responsive Design:
- Mobile-friendly interface
- Adaptive grid layouts
- Touch-friendly controls

## Current Features
- **Incremental Upload**: Add images one batch at a time using "+ Add More Images" button
- **Real-time Progress**: Visual indicators show how many more images are needed
- **Flexible Selection**: Upload as many images as needed, no upper limit
- **Smart Validation**: Clear feedback when minimum requirements are met

## Future Enhancements
- Drag & drop file upload
- Image preview capabilities
- Batch metadata editing
- Progress indicators for large uploads
- Advanced search and filtering
- Bulk operations support

## Support
For technical support or access requests, contact the UC Davis Blood Smear Database administration team.
