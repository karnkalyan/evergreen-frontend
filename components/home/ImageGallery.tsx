import React from 'react';

interface ImageGalleryProps {
    images: string[];
    layout?: 'grid' | 'masonry';
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, layout = 'grid' }) => {
    if (!images || images.length === 0) return null;

    if (layout === 'masonry') {
        return (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                {images.map((src, index) => (
                    <div key={index} className="mb-4 break-inside-avoid" data-aos="zoom-in" data-aos-delay={index * 50}>
                        <img src={src} alt={`Gallery image ${index + 1}`} className="w-full h-auto object-cover rounded-xl shadow-md" />
                    </div>
                ))}
            </div>
        );
    }

    // Default to grid layout
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((src, index) => (
                <div key={index} className="aspect-square" data-aos="zoom-in" data-aos-delay={index * 100}>
                    <img src={src} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover rounded-xl shadow-md" />
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;