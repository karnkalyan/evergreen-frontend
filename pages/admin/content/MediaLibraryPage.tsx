import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ICONS } from '../../../constants';
import Button from '../../../components/shared/Button';
import { mediaService, MEDIA_TYPES } from '../../../lib/mediaService';

interface Media {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  size: number;
  extension: string;
  width?: number;
  height?: number;
  title?: string;
  altText?: string;
  description?: string;
  caption?: string;
  type: string;
  category?: string;
  isUsed: boolean;
  uploadedBy?: number;
  createdAt: string;
  updatedAt: string;
  url: string;
  fullUrl: string;
  thumbnailUrl?: string;
}

// Properties Panel Component
interface PropertiesPanelProps {
  media: Media | null;
  onUpdate: (media: Media) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ media, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    altText: '',
    description: '',
    caption: '',
    category: ''
  });

  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || '',
        altText: media.altText || '',
        description: media.description || '',
        caption: media.caption || '',
        category: media.category || ''
      });
    }
  }, [media]);

  const handleSave = async () => {
    if (!media) return;

    try {
      const response = await mediaService.updateMedia(media.id, formData);
      if (response.success) {
        onUpdate(response.data);
        setIsEditing(false);
        toast.success('Media updated successfully');
      } else {
        toast.error(response.message || 'Failed to update media');
      }
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Failed to update media');
    }
  };

  const handleCancel = () => {
    if (media) {
      setFormData({
        title: media.title || '',
        altText: media.altText || '',
        description: media.description || '',
        caption: media.caption || '',
        category: media.category || ''
      });
    }
    setIsEditing(false);
  };

  if (!media) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="w-12 h-12 mx-auto mb-2">{ICONS.info}</div>
          <p>Select a file to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Properties</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded"
          title="Close panel"
        >
          {React.cloneElement(ICONS.close, { className: 'w-4 h-4' })}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Preview */}
        <div className="mb-6">
          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-3">
            {media.mimeType.startsWith('image/') ? (
              <img
                src={media.fullUrl}
                alt={media.altText || media.originalName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <span className="text-4xl mb-2">
                  {mediaService.getFileTypeIcon(media.mimeType, media.type)}
                </span>
                <span className="text-sm text-slate-600 text-center">
                  {media.extension.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h4 className="font-medium text-slate-800 truncate">
            {media.originalName}
          </h4>
        </div>

        {/* File Information */}
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium text-slate-700 mb-2">File Information</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="text-slate-800">{media.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Size:</span>
                <span className="text-slate-800">{mediaService.formatFileSize(media.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dimensions:</span>
                <span className="text-slate-800">
                  {media.width && media.height ? `${media.width} × ${media.height}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Uploaded:</span>
                <span className="text-slate-800">
                  {new Date(media.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Form */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-medium text-slate-700">Metadata</h5>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primaryStart hover:text-primaryEnd"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="text-xs text-green-600 hover:text-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-xs text-slate-600 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primaryStart"
                  />
                ) : (
                  <p className="text-sm text-slate-800">{media.title || 'No title'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Alt Text</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.altText}
                    onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primaryStart"
                  />
                ) : (
                  <p className="text-sm text-slate-800">{media.altText || 'No alt text'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primaryStart resize-none"
                  />
                ) : (
                  <p className="text-sm text-slate-800">{media.description || 'No description'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Category</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primaryStart"
                  />
                ) : (
                  <p className="text-sm text-slate-800">{media.category || 'Uncategorized'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h5 className="text-sm font-medium text-slate-700 mb-2">Actions</h5>
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(media.fullUrl);
                  toast.success('URL copied to clipboard');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
              >
                {React.cloneElement(ICONS.link || <span>🔗</span>, { className: 'w-4 h-4' })}
                Copy URL
              </button>
              <button
                onClick={() => {
                  window.open(media.fullUrl, '_blank');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
              >
                {React.cloneElement(ICONS.externalLink || <span>↗</span>, { className: 'w-4 h-4' })}
                Open in new tab
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = media.fullUrl;
                  link.download = media.originalName;
                  link.click();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
              >
                {React.cloneElement(ICONS.download || <span>📥</span>, { className: 'w-4 h-4' })}
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview Modal Component
interface PreviewModalProps {
  media: Media | null;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  const isImage = media.mimeType.startsWith('image/');
  const isPDF = media.mimeType.includes('pdf');
  const isVideo = media.mimeType.startsWith('video/');
  const isAudio = media.mimeType.startsWith('audio/');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800 truncate flex-1 mr-4">
            {media.originalName}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(media.fullUrl);
                toast.success('URL copied to clipboard');
              }}
              className="p-2 hover:bg-slate-100 rounded"
              title="Copy URL"
            >
              {React.cloneElement(ICONS.link || <span>🔗</span>, { className: 'w-4 h-4' })}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded"
              title="Close"
            >
              {React.cloneElement(ICONS.close, { className: 'w-4 h-4' })}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
          {isImage ? (
            <img
              src={media.fullUrl}
              alt={media.altText || media.originalName}
              className="max-w-full max-h-full object-contain"
            />
          ) : isPDF ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-slate-600 mb-4">PDF Preview</p>
              <Button
                onClick={() => window.open(media.fullUrl, '_blank')}
                variant="primary"
              >
                Open PDF
              </Button>
            </div>
          ) : isVideo ? (
            <video
              controls
              className="max-w-full max-h-full"
              src={media.fullUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : isAudio ? (
            <div className="text-center w-full max-w-md">
              <div className="text-6xl mb-4">🎵</div>
              <audio
                controls
                className="w-full"
                src={media.fullUrl}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">
                {mediaService.getFileTypeIcon(media.mimeType, media.type)}
              </div>
              <p className="text-slate-600 mb-4">No preview available</p>
              <Button
                onClick={() => window.open(media.fullUrl, '_blank')}
                variant="primary"
              >
                Open File
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 text-sm text-slate-600">
          <div className="flex justify-between items-center">
            <span>{mediaService.formatFileSize(media.size)} • {media.mimeType}</span>
            <span>
              {media.width && media.height ? `${media.width} × ${media.height}` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Media Library Page
const MediaLibraryPage: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<Media[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
    const [showProperties, setShowProperties] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch media items from backend
    const fetchMedia = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await mediaService.getMedia({
                page: 1,
                limit: 50,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
            setMediaItems(response.media || []);
        } catch (error) {
            console.error('Error fetching media:', error);
            toast.error('Failed to load media library');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleFileUpload = async (files: FileList) => {
        if (files.length === 0) return;
        
        setUploading(true);
        try {
            const formData = new FormData();
            
            // Add metadata
            formData.append('title', 'Uploaded Media');
            formData.append('category', 'general');
            
            // Add files - use the same field name as expected by the backend ('files')
            Array.from(files).forEach(file => {
                formData.append('files', file); // This should match the field name in upload middleware
            });

            const response = await mediaService.uploadMedia(formData);
            
            if (response.success) {
                toast.success(`${response.data.media.length} file(s) uploaded successfully!`);
                // Refresh the media list
                await fetchMedia();
            } else {
                toast.error(response.message || 'Failed to upload files');
            }
        } catch (error: any) {
            console.error('Error uploading files:', error);
            
            // More specific error messages
            if (error.message?.includes('File too large')) {
                toast.error('File size too large. Please select smaller files.');
            } else if (error.message?.includes('Invalid file type')) {
                toast.error('Invalid file type. Please upload images, PDFs, or documents.');
            } else if (error.message?.includes('network') || !error.response) {
                toast.error('Network error. Please check your connection and try again.');
            } else {
                toast.error('Failed to upload files. Please try again.');
            }
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };
    
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // Only set dragging to false if leaving the upload area
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragging(false);
    };
    
    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    };
    
    const copyUrl = (media: Media) => {
        navigator.clipboard.writeText(media.fullUrl);
        toast.success('URL copied to clipboard!');
    };

    const deleteItem = async (media: Media) => {
        toast((t) => (
            <div>
                <p className="mb-2">Delete "{media.originalName}"?</p>
                <div className="flex gap-2">
                    <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={async () => {
                            try {
                                const response = await mediaService.deleteMedia(media.id);
                                if (response.success) {
                                    setMediaItems(prev => prev.filter(item => item.id !== media.id));
                                    if (selectedMedia?.id === media.id) {
                                        setSelectedMedia(null);
                                    }
                                    toast.dismiss(t.id);
                                    toast.success('Media deleted successfully');
                                } else {
                                    toast.error(response.message || 'Failed to delete media');
                                }
                            } catch (error) {
                                console.error('Error deleting media:', error);
                                toast.error('Failed to delete media');
                            }
                        }}
                    >
                        Delete
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </Button>
                </div>
            </div>
        ));
    };

    const getFileTypeIcon = (media: Media) => {
        return mediaService.getFileTypeIcon(media.mimeType, media.type);
    };

    const formatFileSize = (bytes: number) => {
        return mediaService.formatFileSize(bytes);
    };

    // Check if file type is image for display
    const isImageFile = (mimeType: string) => {
        return mimeType.startsWith('image/');
    };

    const handleMediaUpdate = (updatedMedia: Media) => {
        setMediaItems(prev => 
            prev.map(item => item.id === updatedMedia.id ? updatedMedia : item)
        );
        setSelectedMedia(updatedMedia);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 bg-white border-b border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-2xl font-poppins font-bold text-slate-800">Media Library</h1>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-600">
                                {mediaItems.length} items • {formatFileSize(mediaItems.reduce((total, item) => total + item.size, 0))}
                            </div>
                            <button
                                onClick={() => setShowProperties(!showProperties)}
                                className="p-2 hover:bg-slate-100 rounded transition-colors"
                                title={showProperties ? 'Hide properties' : 'Show properties'}
                            >
                                {showProperties ? 
                                    React.cloneElement(ICONS.panelClose || <span>◀</span>, { className: 'w-4 h-4' }) :
                                    React.cloneElement(ICONS.panelOpen || <span>▶</span>, { className: 'w-4 h-4' })
                                }
                            </button>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div 
                        className={`p-8 border-2 border-dashed rounded-xl text-center transition-colors ${
                            isDragging ? 'border-primaryEnd bg-primaryEnd/10' : 'border-slate-300 bg-white'
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        <div className="text-primaryStart mb-2 mx-auto w-12 h-12">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryStart mx-auto"></div>
                            ) : (
                                ICONS.upload
                            )}
                        </div>
                        <p className="font-semibold text-slate-700">
                            {uploading ? 'Uploading...' : 'Drag & drop to upload, or click to browse'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            Supports images, PDFs, and documents up to 5MB
                        </p>
                        <input 
                            type="file" 
                            multiple 
                            ref={fileInputRef} 
                            onChange={onFileSelect} 
                            className="hidden" 
                            accept="image/*,.pdf,.doc,.docx,.txt" 
                            disabled={uploading}
                        />
                    </div>
                </div>

                {/* Media Grid */}
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryStart mx-auto"></div>
                            <p className="mt-4 text-slate-600">Loading media library...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {mediaItems.map(media => (
                                    <div 
                                        key={media.id} 
                                        className={`relative group bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all ${
                                            selectedMedia?.id === media.id 
                                                ? 'ring-2 ring-primaryStart border-primaryStart' 
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                        onClick={() => setSelectedMedia(media)}
                                    >
                                        <div className="aspect-square bg-slate-100 relative">
                                            {isImageFile(media.mimeType) ? (
                                                <img 
                                                    src={media.fullUrl} 
                                                    alt={media.altText || media.originalName} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback for broken images
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                    <span className="text-3xl mb-2">{getFileTypeIcon(media)}</span>
                                                    <span className="text-xs text-slate-600 text-center break-words line-clamp-2">
                                                        {media.originalName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                                            <div>
                                                <p className="text-xs text-white break-words line-clamp-2 mb-1">
                                                    {media.originalName}
                                                </p>
                                                <p className="text-xs text-slate-300">
                                                    {formatFileSize(media.size)} • {media.extension.toUpperCase()}
                                                </p>
                                            </div>
                                            <div className="flex justify-end gap-1">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewMedia(media);
                                                    }} 
                                                    className="p-1.5 bg-white/20 rounded-md text-white hover:bg-white/40" 
                                                    title="Preview"
                                                >
                                                    {React.cloneElement(ICONS.eye || <span>👁️</span>, { className: 'w-4 h-4' })}
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyUrl(media);
                                                    }} 
                                                    className="p-1.5 bg-white/20 rounded-md text-white hover:bg-white/40" 
                                                    title="Copy URL"
                                                >
                                                    {React.cloneElement(ICONS.link || <span>🔗</span>, { className: 'w-4 h-4' })}
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteItem(media);
                                                    }} 
                                                    className="p-1.5 bg-white/20 rounded-md text-white hover:bg-white/40" 
                                                    title="Delete"
                                                >
                                                    {React.cloneElement(ICONS.trash, { className: 'w-4 h-4' })}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {mediaItems.length === 0 && !isLoading && (
                                <div className="text-center text-slate-500 py-16">
                                    <p>Your media library is empty.</p>
                                    <p className="text-sm">Upload some files to get started.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Properties Panel */}
            {showProperties && (
                <PropertiesPanel
                    media={selectedMedia}
                    onUpdate={handleMediaUpdate}
                    onClose={() => setSelectedMedia(null)}
                />
            )}

            {/* Preview Modal */}
            {previewMedia && (
                <PreviewModal
                    media={previewMedia}
                    onClose={() => setPreviewMedia(null)}
                />
            )}
        </div>
    );
};

export default MediaLibraryPage;