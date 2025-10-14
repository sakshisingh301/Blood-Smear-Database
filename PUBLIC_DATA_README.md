# Public Data Feature - Species Explorer

This document describes the new public data feature that allows users to browse blood smear data from various bird and mammal species, similar to the Birds of the World website.

## Overview

The public data feature provides a comprehensive species explorer where users can:
- Browse species by taxonomy (birds and mammals)
- Search for specific species
- View detailed species information
- Access blood smear images (cellavision and whole slide images)
- Filter by class, order, and family

## Features

### 1. Species List Page (`/species`)
- **Taxonomy-based browsing**: Browse species organized by class (Aves, Mammalia), order, and family
- **Search functionality**: Search by common name, scientific name, family, or order
- **Filtering**: Filter by class and order
- **Responsive design**: Works on desktop and mobile devices
- **Species cards**: Each species displayed in an attractive card with taxonomy information

### 2. Species Detail Page (`/species/:scientificName`)
- **Species information**: Detailed taxonomy and description
- **Blood smear data**: List of available blood smear records for the species
- **Image viewing**: Access to cellavision and whole slide images
- **Modal image viewer**: Full-screen image viewing with zoom capabilities
- **Record details**: Metadata for each blood smear record

## Technical Implementation

### Backend Components

#### 1. Species Taxonomy Data (`backend/blood-smear-backend/data/speciesTaxonomy.js`)
- Comprehensive taxonomy data for birds and mammals
- Based on:
  - **Birds**: International Ornithological Congress (IOC) - https://www.worldbirdnames.org/new/classification/orders-of-birds-draft/
  - **Mammals**: Mammal Diversity Database - https://www.mammaldiversity.org
- Helper functions for taxonomy navigation and search

#### 2. Species API Routes (`backend/blood-smear-backend/routes/speciesRoute.js`)
- `GET /api/species/taxonomy` - Get all species taxonomy data
- `GET /api/species/taxonomy/:className` - Get species by class
- `GET /api/species/taxonomy/:className/:orderName` - Get species by order
- `GET /api/species/taxonomy/:className/:orderName/:familyName` - Get species by family
- `GET /api/species/taxonomy/species/:scientificName` - Get specific species info
- `GET /api/species/search?q=query` - Search species
- `GET /api/species/data/:scientificName` - Get blood smear data for species
- `GET /api/species/data/:scientificName/:jobId` - Get detailed record with images
- `GET /api/species/data` - Get all approved blood smear data

### Frontend Components

#### 1. Species List Page (`frontend/blood-smear-frontend/src/routes/SpeciesListPage.jsx`)
- React component for browsing species
- Search and filter functionality
- Responsive grid layout
- Integration with backend API

#### 2. Species Detail Page (`frontend/blood-smear-frontend/src/routes/SpeciesDetailPage.jsx`)
- Detailed species information display
- Blood smear record listing
- Image modal viewer
- Record detail fetching

#### 3. Navigation Integration
- Added "Public Data" section to main navigation
- "Species Explorer" link in navbar dropdown
- Prominent call-to-action on homepage

## Data Sources

### Bird Taxonomy
Based on the International Ornithological Congress (IOC) classification system:
- **Passeriformes**: House Sparrow, Eurasian Tree Sparrow, Common Raven, American Crow
- **Accipitriformes**: Bald Eagle, Cooper's Hawk
- **Strigiformes**: Great Horned Owl

### Mammal Taxonomy
Based on the Mammal Diversity Database:
- **Carnivora**: Gray Wolf, Coyote, Red Fox, Domestic Cat, Lion
- **Artiodactyla**: Red Deer, White-tailed Deer
- **Primates**: Human

## Usage

### For Users
1. Navigate to the homepage
2. Click "Explore Species Database" or use the "Public Data" menu
3. Browse species by taxonomy or use search
4. Click on any species to view detailed information
5. View blood smear images and metadata

### For Administrators
- Blood smear data is automatically linked to species based on scientific names
- Only approved records with status 'ready_for_access' are displayed
- Images are served from S3 storage with proper access controls

## Future Enhancements

1. **Additional Species**: Expand taxonomy data with more species
2. **Advanced Search**: Add more sophisticated search capabilities
3. **Data Export**: Allow users to download datasets
4. **Image Annotations**: Add annotation capabilities for research
5. **Comparative Analysis**: Tools for comparing species data
6. **API Documentation**: Comprehensive API documentation for researchers

## Security Considerations

- Only approved blood smear records are accessible
- Images are served through secure S3 URLs
- No sensitive metadata is exposed in public endpoints
- Rate limiting should be implemented for API endpoints

## Performance Considerations

- Species taxonomy data is cached in memory
- Image thumbnails for better loading performance
- Pagination for large datasets
- Lazy loading for image galleries

## Browser Support

- Modern browsers with ES6+ support
- Responsive design for mobile devices
- Progressive enhancement for older browsers
