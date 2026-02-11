import React, { useEffect, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import './WholeSlideViewer.css';

const WholeSlideViewer = ({ dziUrl, metadata }) => {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);

  useEffect(() => {
    if (!dziUrl || !viewerRef.current) return;

    // Fix duplicate CloudFront URLs and properly encode
    const encodeProperUrl = (url) => {
      try {
        // Fix duplicate domain issue (backend sometimes returns duplicate URLs)
        // https://domain.com/https://domain.com/path -> https://domain.com/path
        const duplicatePattern = /^(https?:\/\/[^\/]+)\/(https?:\/\/[^\/]+)\/(.+)$/;
        const match = url.match(duplicatePattern);
        
        let cleanedUrl = url;
        if (match && match[1] === match[2]) {
          // Duplicate domain found, use only one
          cleanedUrl = `${match[1]}/${match[3]}`;
          console.log('⚠️ Fixed duplicate domain in URL');
          console.log('   Before:', url);
          console.log('   After:', cleanedUrl);
        }
        
        // Parse the URL to separate the base and path
        const urlObj = new URL(cleanedUrl);
        
        // Check if URL is already encoded by trying to decode it
        // If decoding changes the URL, it was already encoded
        const isAlreadyEncoded = urlObj.pathname !== decodeURIComponent(urlObj.pathname);
        
        if (isAlreadyEncoded) {
          console.log('✅ URL is already encoded, using as-is');
          console.log('🔗 URL:', cleanedUrl);
          return cleanedUrl;
        }
        
        // URL is not encoded, encode each segment
        console.log('🔧 Encoding URL segments');
        const pathSegments = urlObj.pathname.split('/');
        const encodedSegments = pathSegments.map(segment => 
          segment ? encodeURIComponent(segment) : segment
        );
        urlObj.pathname = encodedSegments.join('/');
        const encodedUrl = urlObj.toString();
        console.log('🔗 Original URL:', url);
        console.log('🔗 Encoded URL:', encodedUrl);
        return encodedUrl;
      } catch (error) {
        console.error('❌ Error encoding URL:', error);
        // Fallback: simple replace spaces with %20
        return url.replace(/ /g, '%20');
      }
    };

    const encodedDziUrl = encodeProperUrl(dziUrl);

    // Initialize OpenSeadragon viewer
    viewerInstance.current = OpenSeadragon({
      id: viewerRef.current.id,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/', // For UI buttons
      
      // Use the properly encoded DZI URL
      tileSources: encodedDziUrl,
      
      // Viewer configuration
      showNavigationControl: true,
      showNavigator: true, // Mini-map in corner
      navigatorPosition: 'BOTTOM_RIGHT',
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 2,
      minZoomLevel: 0.5,
      visibilityRatio: 1,
      zoomPerScroll: 1.2,
      
      // Performance settings
      immediateRender: false,
      preload: true,
      timeout: 120000,
      
      // Tile loading settings - OpenSeadragon handles this automatically!
      imageLoaderLimit: 4, // Load 4 tiles at a time
      
      // UI
      showFullPageControl: true,
      showHomeControl: true,
      showZoomControl: true,
      showRotationControl: true,
      
      // Add CORS settings
      crossOriginPolicy: 'Anonymous',
      ajaxWithCredentials: false,
    });

    // Event listeners for debugging/analytics
    viewerInstance.current.addHandler('open', () => {
      console.log('✅ OpenSeadragon viewer opened successfully');
    });

    viewerInstance.current.addHandler('open-failed', (event) => {
      console.error('❌ OpenSeadragon failed to open:', event);
      console.error('❌ Attempted URL:', encodedDziUrl);
    });

    viewerInstance.current.addHandler('tile-loaded', (event) => {
      console.log('🔄 Tile loaded:', event.tile.url);
    });

    viewerInstance.current.addHandler('tile-load-failed', (event) => {
      console.error('❌ Tile load failed:', event.tile.url);
    });

    viewerInstance.current.addHandler('zoom', (event) => {
      console.log('🔍 Zoom level:', event.zoom);
    });

    // Cleanup on unmount
    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [dziUrl]);

  return (
    <div className="whole-slide-viewer-container">
      <div className="viewer-header">
        <h3>Whole Slide Image Viewer</h3>
        {metadata && (
          <div className="image-metadata">
            <span>📐 {metadata.image_width?.toLocaleString()} × {metadata.image_height?.toLocaleString()} px</span>
            <span>🔢 {metadata.pyramid_levels} zoom levels</span>
            <span>🧩 {metadata.tile_count?.toLocaleString()} tiles</span>
            <span>📦 Tile size: {metadata.tile_size}px</span>
          </div>
        )}
      </div>
      
      <div 
        id="openseadragon-viewer"
        ref={viewerRef}
        className="openseadragon-viewer"
      />
      
      <div className="viewer-info">
        <p>🖱️ Use mouse to pan and scroll to zoom. Click the controls in the top-left corner for more options.</p>
      </div>
    </div>
  );
};

export default WholeSlideViewer;

