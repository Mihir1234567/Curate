import React, { useState } from "react";

interface ImageGalleryProps {
  images: string[]; // Or string if single image
  alt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  // If images is just one string
  const imageList = Array.isArray(images) ? images : [images];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="hidden md:block md:col-span-2 space-y-4">
        {imageList.map((img, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg overflow-hidden border cursor-pointer transition-colors ${selectedImage === img ? "border-primary" : "border-gray-200 hover:border-primary"}`}
            onClick={() => setSelectedImage(img)}
          >
            <img
              src={img}
              className="w-full h-full object-cover"
              alt={"Thumbnail"}
            />
          </div>
        ))}
      </div>
      <div className="md:col-span-10">
        <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
          <img
            src={selectedImage || imageList[0]}
            className="w-full h-full object-cover"
            alt={alt}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
