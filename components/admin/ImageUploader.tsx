import React, { useState, useCallback, useRef } from 'react';
import { ICONS } from '../../constants';
import { toast } from 'react-hot-toast';

interface ImageUploaderProps {
    onImagesChange: (images: File[]) => void;
    existingImages?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    onRemoveExistingImage?: (imageUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImagesChange, 
    existingImages = [], 
    onRemoveExistingImage 
}) => {
    const [images, setImages] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const updateImages = (newImages: File[]) => {
        setImages(newImages);
        onImagesChange(newImages);
    };

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;
        
        const newImages: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                newImages.push(file);
            } else {
                toast.error(`${file.name} is not a valid image file.`);
            }
        }
        
        if (newImages.length > 0) {
            updateImages([...images, ...newImages]);
            toast.success(`Added ${newImages.length} image(s)`);
        }
    }, [images]);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset the input value to allow selecting the same file again
        if (e.target) e.target.value = '';
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        updateImages(newImages);
        toast.success('Image removed');
    };

    const removeExistingImage = (imageUrl: string) => {
        if (onRemoveExistingImage) {
            onRemoveExistingImage(imageUrl);
            toast.success('Existing image marked for removal');
        }
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newImages = [...images];
        const draggedItemContent = newImages.splice(dragItem.current, 1)[0];
        newImages.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        updateImages(newImages);
    };

    // Create preview URLs for new images
    const newImagePreviews = images.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        isNew: true
    }));

    // Combine existing and new images for display
    const allImages = [
        ...existingImages.map(img => ({ ...img, isNew: false })),
        ...newImagePreviews
    ];

    const primaryImage = allImages.find(img => img.isPrimary) || allImages[0];

    return (
        <div className="space-y-6">
            {/* Primary Image Display */}
            {primaryImage && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Image</label>
                    <div className="relative inline-block">
                        <img
                            src={primaryImage.url}
                            alt={primaryImage.alt || 'Primary product image'}
                            className="w-32 h-32 object-cover rounded-lg border-2 border-primaryEnd shadow-sm"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                        />
                        {primaryImage.isPrimary && (
                            <span className="absolute top-2 left-2 bg-primaryEnd text-white text-xs px-2 py-1 rounded">
                                Primary
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* All Images Grid */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    All Images ({allImages.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                    {allImages.map((image, index) => (
                        <div 
                            key={index} 
                            className="relative group aspect-square"
                            draggable={image.isNew}
                            onDragStart={() => image.isNew && (dragItem.current = index)}
                            onDragEnter={() => image.isNew && (dragOverItem.current = index)}
                            onDragEnd={image.isNew ? handleDragSort : undefined}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <img
                                src={image.url}
                                alt={image.alt || `Product image ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-slate-200"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <button
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        image.isNew ? removeImage(index - existingImages.length) : removeExistingImage(image.url);
                                    }}
                                    className="text-white bg-coral/80 hover:bg-coral rounded-full p-1.5 transition-colors"
                                    aria-label="Remove image"
                                >
                                    {React.cloneElement(ICONS.close, {className: "h-4 w-4"})}
                                </button>
                            </div>
                            
                            {/* Badges */}
                            {image.isPrimary && !image.isNew && (
                                <div className="absolute top-1 left-1 bg-primaryEnd text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                                    Primary
                                </div>
                            )}
                            {image.isNew && (
                                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                                    New
                                </div>
                            )}
                            {!image.isPrimary && !image.isNew && (
                                <div className="absolute top-1 left-1 bg-slate-800/60 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                                    {index + 1}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragging ? 'border-primaryEnd bg-primaryEnd/10' : 'border-slate-300 bg-slate-50'
                }`}
            >
                <div className="text-primaryStart mb-2">{ICONS.upload}</div>
                <p className="font-semibold text-slate-700 text-sm">Drag & drop images here, or click to select</p>
                <p className="text-xs text-slate-500">First image is the main image. Drag to reorder new images.</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*"
                />
            </div>

            {/* Help Text */}
            <div className="text-xs text-slate-500 space-y-1">
                <p>• The first image will be used as the primary product image</p>
                <p>• You can upload up to 10 images total</p>
                <p>• Supported formats: JPG, PNG, GIF, WEBP</p>
                <p>• Drag and drop to reorder new images (existing images maintain their order)</p>
            </div>
        </div>
    );
};

export default ImageUploader;