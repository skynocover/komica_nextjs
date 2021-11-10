import React, { useCallback } from 'react';
import ImageViewer from 'react-simple-image-viewer';

export const Image = ({ image }: { image: string }) => {
  const [currentImage, setCurrentImage] = React.useState(0);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  const openImageViewer = useCallback(() => setIsViewerOpen(true), []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };
  return (
    <div>
      <img src={image} onClick={() => openImageViewer()} width="100%" style={{ margin: '2px' }} />

      {isViewerOpen && (
        <ImageViewer
          src={[image]}
          currentIndex={currentImage}
          onClose={closeImageViewer}
          disableScroll={false}
          backgroundStyle={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          closeOnClickOutside={true}
        />
      )}
    </div>
  );
};
