
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getSafeImageUrl } from '@/utils/image-utils';

interface GalleryItemProps {
  image: string;
  title: string;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ image, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [safeImageUrl, setSafeImageUrl] = useState("/placeholders/default-event.jpg");
  
  useEffect(() => {
    const loadImage = async () => {
      const url = await getSafeImageUrl(image, 'event');
      setSafeImageUrl(url);
    };
    
    loadImage();
  }, [image]);

  return (
    <>
      <div 
        className="overflow-hidden rounded-md cursor-pointer group animate-zoom-in"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative h-60 md:h-72">
          <img 
            src={safeImageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholders/default-event.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mouro-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              <h3 className="text-white font-medium">{title}</h3>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-0">
          <div className="relative">
            <img 
              src={safeImageUrl} 
              alt={title} 
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholders/default-event.jpg";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-mouro-black/80 p-4">
              <h3 className="text-white font-medium">{title}</h3>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GalleryItem;
