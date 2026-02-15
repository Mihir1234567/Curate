import React, { useState, useEffect } from "react";
import { ProductImage } from "../../types/product";

interface ImageGalleryProps {
  images: ProductImage[];
  alt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      const mainImg = images.find((img) => img.isMain) || images[0];
      setSelectedImage(mainImg);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
        <span className="material-icons-outlined text-4xl">
          image_not_supported
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="hidden md:block md:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {images.map((img, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 ${selectedImage?.url === img.url ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-gray-200 hover:border-primary/50"}`}
            onClick={() => setSelectedImage(img)}
          >
            <img
              src={img.url}
              className="w-full h-full object-cover"
              alt={`Thumbnail ${i + 1}`}
            />
          </div>
        ))}
      </div>
      <div className="md:col-span-10">
        <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative group">
          <img
            src={selectedImage?.url || images[0].url}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt={alt}
          />
        </div>

        {/* Mobile thumbnails */}
        <div className="flex md:hidden gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${selectedImage?.url === img.url ? "border-primary" : "border-transparent"}`}
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.url}
                className="w-full h-full object-cover"
                alt={`Thumbnail ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
