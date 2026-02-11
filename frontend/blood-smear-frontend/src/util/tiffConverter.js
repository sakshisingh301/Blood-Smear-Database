// utils/tiffConverter.js
import UTIF from 'utif';

/**
 * Converts a TIFF image URL to a PNG blob URL
 * @param {string} url - The image URL (TIFF or other format)
 * @returns {Promise<string>} - Returns PNG blob URL if TIFF, otherwise returns original URL
 */
export async function convertTiffToPng(url) {
  if (!url) {
    return null;
  }

  // Fix CloudFront URL if missing protocol
  let fullUrl = url;
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    fullUrl = `https://${url}`;
  }

  // Check if it's a TIFF file
  const isTiff = fullUrl.toLowerCase().endsWith('.tiff') || fullUrl.toLowerCase().endsWith('.tif');
  
  if (!isTiff) {
    console.log('📄 Skipping non-TIFF file:', fullUrl);
    return fullUrl; // Return original URL if not TIFF
  }

  try {
    console.log('🔄 Converting TIFF to PNG:', fullUrl);
    
    // Fetch TIFF file
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    console.log('📦 TIFF buffer size:', buffer.byteLength, 'bytes');
    
    // Decode TIFF using UTIF
    const ifds = UTIF.decode(buffer);
    if (!ifds || ifds.length === 0) {
      throw new Error('No valid TIFF data found');
    }
    
    console.log('🔍 Found', ifds.length, 'TIFF IFDs');
    console.log('📊 IFD 0 properties:', {
      width: ifds[0].width,
      height: ifds[0].height,
      bps: ifds[0].bps,
      spp: ifds[0].spp,
      compression: ifds[0].compression,
      photometricInterpretation: ifds[0].photometricInterpretation
    });
    
    // Try to decode the image
    UTIF.decodeImage(buffer, ifds[0]);
    
    // Check dimensions after decoding
    let width = ifds[0].width;
    let height = ifds[0].height;
    
    // If dimensions are still undefined, try alternative approaches
    if (!width || !height || width <= 0 || height <= 0) {
      console.warn('⚠️ Invalid TIFF dimensions after decode:', { width, height });
      
      // Try to get dimensions from other properties
      if (ifds[0].t256 && ifds[0].t257) {
        width = ifds[0].t256;
        height = ifds[0].t257;
        console.log('🔧 Trying alternative dimensions:', { width, height });
      }
      
      // If still invalid, return original URL
      if (!width || !height || width <= 0 || height <= 0) {
        console.warn('❌ Cannot determine valid TIFF dimensions, returning original URL');
        return fullUrl;
      }
    }
    
    console.log('✅ Valid TIFF dimensions:', { width, height });
    
    // Convert to RGBA
    const rgba = UTIF.toRGBA8(ifds[0]);
    console.log('🎨 RGBA data length:', rgba.length, 'bytes');
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Validate RGBA data length
    const expectedLength = width * height * 4;
    if (rgba.length !== expectedLength) {
      console.warn('⚠️ RGBA data length mismatch. Expected:', expectedLength, 'Got:', rgba.length);
      
      // Try to create a smaller canvas if data is insufficient
      if (rgba.length < expectedLength) {
        const actualPixels = Math.floor(rgba.length / 4);
        const actualHeight = Math.floor(actualPixels / width);
        if (actualHeight > 0) {
          console.log('🔧 Adjusting canvas size to match data:', { width, height: actualHeight });
          canvas.height = actualHeight;
        } else {
          return fullUrl;
        }
      }
    }
    
    // Create ImageData
    const imageData = new ImageData(
      new Uint8ClampedArray(rgba),
      width,
      canvas.height
    );
    
    ctx.putImageData(imageData, 0, 0);
    
    // Convert canvas to blob and return blob URL
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          console.log('✅ TIFF converted to PNG blob:', pngUrl, 'Size:', blob.size, 'bytes');
          resolve(pngUrl);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png', 0.95); // Slightly lower quality for smaller file size
    });
    
  } catch (error) {
    console.error('❌ TIFF to PNG conversion error:', error);
    console.log('🔄 Falling back to original URL:', fullUrl);
    return fullUrl; // Return original URL on error
  }
}

/**
 * Converts all TIFF URLs in uploadData to PNG blob URLs
 * @param {object} uploadData - The upload data containing image URLs
 * @returns {Promise<object>} - Upload data with converted PNG URLs
 */
export async function convertUploadDataTiffsToPng(uploadData) {
  if (!uploadData) return uploadData;

  const converted = JSON.parse(JSON.stringify(uploadData)); // Deep clone

  // Convert whole slide image if exists
  if (converted.whole_slide_image?.s3_storage?.cloudfront_url) {
    console.log('🔄 Converting whole slide TIFF...');
    const originalUrl = converted.whole_slide_image.s3_storage.cloudfront_url;
    const pngUrl = await convertTiffToPng(originalUrl);
    
    // Store PNG URL in a new field so we keep the original
    converted.whole_slide_image.s3_storage.png_url = pngUrl;
    converted.whole_slide_image.s3_storage.original_tiff_url = originalUrl;
  }

  // Also convert S3 URL if needed
  if (converted.whole_slide_image?.s3_storage?.s3_url) {
    console.log('🔄 Converting whole slide S3 TIFF...');
    const originalUrl = converted.whole_slide_image.s3_storage.s3_url;
    const pngUrl = await convertTiffToPng(originalUrl);
    
    if (!converted.whole_slide_image.s3_storage.png_url) {
      converted.whole_slide_image.s3_storage.png_url = pngUrl;
      converted.whole_slide_image.s3_storage.original_tiff_url = originalUrl;
    }
  }

  // Convert cellavision images if they exist
  if (converted.cellavision_images) {
    console.log('🔄 Converting cellavision TIFFs...');
    for (const [key, images] of Object.entries(converted.cellavision_images)) {
      if (Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          // Convert cloudfront_url
          if (images[i]?.s3_storage?.cloudfront_url) {
            console.log(`🔄 Converting cellavision ${key} TIFF ${i}...`);
            const originalUrl = images[i].s3_storage.cloudfront_url;
            const pngUrl = await convertTiffToPng(originalUrl);
            images[i].s3_storage.png_url = pngUrl;
            images[i].s3_storage.original_tiff_url = originalUrl;
          }
          // Convert s3_url
          if (images[i]?.s3_storage?.s3_url && !images[i].s3_storage.png_url) {
            console.log(`🔄 Converting cellavision ${key} S3 TIFF ${i}...`);
            const originalUrl = images[i].s3_storage.s3_url;
            const pngUrl = await convertTiffToPng(originalUrl);
            images[i].s3_storage.png_url = pngUrl;
            images[i].s3_storage.original_tiff_url = originalUrl;
          }
        }
      }
    }
  }

  console.log('✅ All TIFF conversions completed');
  return converted;
}