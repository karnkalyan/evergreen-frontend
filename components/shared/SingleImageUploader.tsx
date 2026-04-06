import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ICONS } from '../../constants';
import { toast } from 'react-hot-toast';

interface SingleImageUploaderProps {
    onFileChange: (file: File | null) => void;
    initialImage?: string | null;
}

const SingleImageUploader: React.FC<SingleImageUploaderProps> = ({ onFileChange, initialImage }) => {
    const [preview, setPreview] = useState<string | null>(initialImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setPreview(initialImage || null);
    }, [initialImage]);

    const handleFile = useCallback((file: File | null) => {
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
                onFileChange(file);
            } else {
                toast.error('Please select a valid image file.');
                onFileChange(null);
            }
        } else {
            setPreview(null);
            onFileChange(null);
        }
    }, [onFileChange]);
    
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
        if(e.target) e.target.value = '';
    };

    const removeImage = () => {
        handleFile(null);
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                className="hidden"
                accept="image/*"
            />
            {preview ? (
                <div className="relative group w-full aspect-video">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg border" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={removeImage}
                            className="text-white bg-coral/80 rounded-full p-2"
                            aria-label="Remove image"
                        >
                            {React.cloneElement(ICONS.trash, { className: "h-5 w-5" })}
                        </button>
                    </div>
                </div>
            ) : (
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
                    <p className="font-semibold text-slate-700 text-sm">Drag & drop an image here, or click to select</p>
                </div>
            )}
        </div>
    );
};

export default SingleImageUploader;