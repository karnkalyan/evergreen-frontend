import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Button from '../../../components/shared/Button';
import { ICONS } from '../../../constants';
import { toast } from 'react-hot-toast';
import TableControls from '../../../components/admin/TableControls';
import AdminPagination from '../../../components/admin/AdminPagination';
import { blogService } from '../../../lib/blogService';
import { mediaService } from '../../../lib/mediaService';

// Safe icon renderer function
const renderIcon = (icon, className = '', fallback = '') => {
  if (!icon || typeof icon === 'undefined') {
    return <span className={className}>{fallback}</span>;
  }
  
  try {
    return React.cloneElement(icon, { className });
  } catch (error) {
    console.warn('Error rendering icon:', error);
    return <span className={className}>{fallback}</span>;
  }
};

// CSS for Quill Editor
const quillStyles = `
.quill-editor-custom .ql-toolbar {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.quill-editor-custom .ql-container {
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 8px 8px;
  min-height: 400px;
  font-size: 14px;
  line-height: 1.6;
}

.quill-editor-custom .ql-editor {
  min-height: 400px;
}

.quill-editor-custom .ql-editor img {
  max-width: 100%;
  height: auto;
}
`;

// Quill Editor Component with Image Handling
const QuillEditor = ({ value, onChange, placeholder = "Write your blog content here..." }) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const ReactQuillRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // Add styles to head
    const styleElement = document.createElement('style');
    styleElement.textContent = quillStyles;
    document.head.appendChild(styleElement);

    // Dynamically import Quill to avoid SSR issues
    const loadQuill = async () => {
      try {
        const ReactQuill = (await import('react-quill')).default;
        ReactQuillRef.current = ReactQuill;
        setEditorLoaded(true);
      } catch (error) {
        console.error('Error loading Quill editor:', error);
        toast.error('Failed to load editor');
      }
    };
    
    loadQuill();

    return () => {
      // Clean up style element
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  // Custom image handler to prevent large base64 images
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      try {
        // Upload to media service instead of using base64
        toast.loading('Uploading image...');
        const formData = new FormData();
        formData.append('files', file);
        formData.append('title', `Blog Image ${Date.now()}`);
        formData.append('category', 'blog');

        const response = await mediaService.uploadMedia(formData);
        
        if (response.success && response.data.media.length > 0) {
          const uploadedImage = response.data.media[0];
          const imageUrl = uploadedImage.fullUrl.replace(/\\/g, '/');
          
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            quill.insertEmbed(range?.index || 0, 'image', imageUrl);
          }
          toast.dismiss();
          toast.success('Image uploaded successfully!');
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.dismiss();
        toast.error('Failed to upload image. Please use the featured image upload for large images.');
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [imageHandler]);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  if (!editorLoaded) {
    return (
      <div className="border border-slate-300 rounded-lg min-h-[400px] flex items-center justify-center">
        <div className="text-slate-500">Loading editor...</div>
      </div>
    );
  }

  const ReactQuill = ReactQuillRef.current;

  return (
    <div className="quill-editor-custom">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        style={{ minHeight: '400px' }}
      />
      
      {/* Content size warning */}
      {value && value.length > 100000 && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ Your content is quite large ({Math.round(value.length / 1024)}KB). 
          Consider uploading large images separately using the featured image upload.
        </div>
      )}
    </div>
  );
};

// Featured Image Upload Component (keep the same as before)
const FeaturedImageUpload = ({ value, onChange, onRemove }) => {
  const [uploading, setUploading] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', 'Blog Featured Image');
      formData.append('category', 'blog');
      
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await mediaService.uploadMedia(formData);
      
      if (response.success && response.data.media.length > 0) {
        const uploadedImage = response.data.media[0];
        // Normalize the URL to use forward slashes
        const normalizedUrl = uploadedImage.fullUrl.replace(/\\/g, '/');
        onChange(normalizedUrl);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      {value && (
        <div className="relative group">
          <img 
            src={value} 
            alt="Featured preview" 
            className="w-full h-48 object-cover rounded-lg border border-slate-300"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <button
              type="button"
              onClick={onRemove}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              {renderIcon(ICONS?.trash, 'w-4 h-4', '🗑️')}
            </button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Upload Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload Options
          </label>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowMediaLibrary(true)}
              className="flex-1"
            >
              Media Library
            </Button>
          </div>

          {/* Drop Zone */}
          <div 
            className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primaryStart transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-slate-400 mb-2">
              {renderIcon(ICONS?.upload, 'w-8 h-8 mx-auto', '📤')}
            </div>
            <p className="text-sm text-slate-600">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPG, PNG, WebP (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
        multiple={false}
      />

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibraryModal 
          onSelect={(imageUrl) => {
            // Normalize the URL to use forward slashes
            const normalizedUrl = imageUrl.replace(/\\/g, '/');
            onChange(normalizedUrl);
            setShowMediaLibrary(false);
          }}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
    </div>
  );
};

// Simple Media Library Modal (keep the same as before)
const MediaLibraryModal = ({ onSelect, onClose }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        const response = await mediaService.getMedia({
          page: 1,
          limit: 20,
          type: 'IMAGE'
        });
        setMediaItems(response.media || []);
      } catch (error) {
        console.error('Error fetching media:', error);
        toast.error('Failed to load media library');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">Select Featured Image</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {renderIcon(ICONS?.close, 'w-5 h-5', '✕')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryStart"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaItems.map(media => (
                <div 
                  key={media.id}
                  className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-primaryStart transition-colors group"
                  onClick={() => onSelect(media.fullUrl)}
                >
                  <div className="aspect-square bg-slate-100">
                    <img 
                      src={media.fullUrl} 
                      alt={media.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-slate-600 truncate">
                      {media.originalName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Blog Editor Component (keep the same as before, but it will use the updated QuillEditor)
const BlogEditor = ({ post, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    content: '',
    excerpt: '',
    status: 'draft',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    seoKeywords: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [autoGenerateSEO, setAutoGenerateSEO] = useState(true);

  // Initialize form data when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        author: post.author || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        status: post.status || 'draft',
        featuredImage: post.featuredImage || '',
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        canonicalUrl: post.canonicalUrl || '',
        seoKeywords: post.seoKeywords || ''
      });
    } else {
      // Reset to defaults for new post
      setFormData({
        title: '',
        slug: '',
        author: '',
        content: '',
        excerpt: '',
        status: 'draft',
        featuredImage: '',
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        seoKeywords: ''
      });
    }
  }, [post]);

  // Auto-generate slug and SEO fields when title changes
  useEffect(() => {
    if (autoGenerateSEO && formData.title) {
      const slug = blogService.generateSlug(formData.title);
      const metaTitle = blogService.generateMetaTitle(formData.title);
      const metaDescription = blogService.generateMetaDescription(formData.content || formData.excerpt);

      setFormData(prev => ({
        ...prev,
        slug: prev.slug || slug,
        metaTitle: prev.metaTitle || metaTitle,
        metaDescription: prev.metaDescription || metaDescription
      }));
    }
  }, [formData.title, formData.content, autoGenerateSEO]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (autoGenerateSEO && formData.content && !formData.excerpt) {
      const excerpt = blogService.generateMetaDescription(formData.content, 300);
      setFormData(prev => ({
        ...prev,
        excerpt: prev.excerpt || excerpt
      }));
    }
  }, [formData.content, autoGenerateSEO]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    if (!formData.author.trim()) {
      toast.error('Author is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsLoading(true);

    try {
      // Normalize the featured image URL - convert backslashes to forward slashes
      const normalizedFeaturedImage = formData.featuredImage ? 
        formData.featuredImage.replace(/\\/g, '/') : 
        null;

      const postData = {
        ...formData,
        featuredImage: normalizedFeaturedImage,
        publishDate: formData.status === 'published' ? new Date().toISOString() : undefined
      };

      console.log('Saving blog post with data. Content length:', postData.content?.length);

      let response;
      if (post) {
        response = await blogService.updateBlogPost(post.id, postData);
      } else {
        response = await blogService.createBlogPost(postData);
      }

      if (response && response.success) {
        toast.success(response.message || (post ? 'Blog post updated successfully!' : 'Blog post created successfully!'));
        onSave(response.data || response.post || postData);
      } else {
        throw new Error(response?.error || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error(error.message || 'Failed to save blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    if (window.confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      try {
        await blogService.deleteBlogPost(post.id);
        toast.success('Blog post deleted successfully!');
        onDelete(post.id);
      } catch (error) {
        console.error('Error deleting blog post:', error);
        toast.error('Failed to delete blog post');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-soft-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          {post && (
            <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
              Delete
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (post ? 'Update Post' : 'Create Post')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
                placeholder="Enter blog post title"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
                placeholder="blog-post-slug"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                URL-friendly version of the title
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
                placeholder="Author name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
                disabled={isLoading}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Featured Image
              </label>
              <FeaturedImageUpload
                value={formData.featuredImage}
                onChange={(imageUrl) => setFormData(prev => ({ ...prev, featuredImage: imageUrl }))}
                onRemove={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent resize-none"
                placeholder="Brief description of the blog post"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.excerpt?.length || 0}/300 characters
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Content *
          </label>
          <QuillEditor
            value={formData.content}
            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
          />
        </div>

        {/* SEO Settings */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">SEO Settings</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoGenerateSEO}
                onChange={(e) => setAutoGenerateSEO(e.target.checked)}
                className="rounded border-slate-300 text-primaryStart focus:ring-primaryStart"
                disabled={isLoading}
              />
              <span className="text-sm text-slate-600">Auto-generate SEO fields</span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
                placeholder="Meta title for search engines"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
                placeholder="https://example.com/canonical-url"
                disabled={isLoading}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent resize-none"
                placeholder="Meta description for search engines"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.metaDescription?.length || 0}/160 characters
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SEO Keywords
              </label>
              <input
                type="text"
                value={formData.seoKeywords}
                onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
                placeholder="keyword1, keyword2, keyword3"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// Status Badge Component with Toggle (keep the same as before)
const StatusBadge = ({ status, onStatusChange, postId }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await blogService.updateBlogPost(postId, { status: newStatus });
      toast.success(`Post status updated to ${newStatus}`);
      onStatusChange(postId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (currentStatus) => {
    const config = {
      draft: { 
        label: 'Draft', 
        class: 'bg-slate-100 text-slate-800',
        next: 'published',
        nextLabel: 'Publish'
      },
      published: { 
        label: 'Published', 
        class: 'bg-green-100 text-green-800',
        next: 'draft',
        nextLabel: 'Unpublish'
      },
      archived: { 
        label: 'Archived', 
        class: 'bg-orange-100 text-orange-800',
        next: 'draft',
        nextLabel: 'Restore'
      }
    };
    return config[currentStatus] || config.draft;
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        {config.label}
      </span>
      <button
        onClick={() => handleStatusChange(config.next)}
        disabled={isUpdating}
        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        title={`Click to ${config.nextLabel}`}
      >
        {isUpdating ? '...' : config.nextLabel}
      </button>
    </div>
  );
};

// View Modal Component (keep the same as before)
const BlogPostViewModal = ({ post, onClose }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">{post.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {renderIcon(ICONS?.close, 'w-5 h-5', '✕')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Meta Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-slate-600">Author:</span>
                <p className="mt-1">{post.author}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Status:</span>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    post.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : post.status === 'draft'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {post.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Published:</span>
                <p className="mt-1">
                  {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'Not published'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Views:</span>
                <p className="mt-1">{post.views || 0}</p>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div>
                <span className="font-semibold text-slate-600 block mb-2">Featured Image:</span>
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-300"
                />
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div>
                <span className="font-semibold text-slate-600 block mb-2">Excerpt:</span>
                <p className="text-slate-700 leading-relaxed">{post.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div>
              <span className="font-semibold text-slate-600 block mb-2">Content:</span>
              <div 
                className="prose max-w-none text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* SEO Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-slate-600 mb-4">SEO Information</h3>
              <div className="space-y-3 text-sm">
                {post.metaTitle && (
                  <div>
                    <span className="font-medium text-slate-600">Meta Title:</span>
                    <p className="mt-1 text-slate-700">{post.metaTitle}</p>
                  </div>
                )}
                {post.metaDescription && (
                  <div>
                    <span className="font-medium text-slate-600">Meta Description:</span>
                    <p className="mt-1 text-slate-700">{post.metaDescription}</p>
                  </div>
                )}
                {post.seoKeywords && (
                  <div>
                    <span className="font-medium text-slate-600">SEO Keywords:</span>
                    <p className="mt-1 text-slate-700">{post.seoKeywords}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Blog Management Page (keep the same as before)
const BlogManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [currentView, setCurrentView] = useState('list'); // 'list', 'edit', 'view'
    const [editingPost, setEditingPost] = useState(null);
    const [viewingPost, setViewingPost] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 10;

    // Fetch posts from API
    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const response = await blogService.getBlogPosts({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: searchTerm,
                sortBy: 'publishDate',
                sortOrder: 'desc'
            });
            
            if (response && response.posts) {
                setPosts(response.posts);
                setTotalCount(response.pagination?.total || response.posts.length);
            } else {
                setPosts([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            toast.error('Failed to load blog posts');
            setPosts([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [currentPage, searchTerm]);

    const handleAddNew = () => {
        setEditingPost(null);
        setCurrentView('edit');
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setCurrentView('edit');
    };

    const handleView = (post) => {
        setViewingPost(post);
        setCurrentView('view');
    };

    const handleSave = (savedPost) => {
        // Refresh the posts list
        fetchPosts();
        setCurrentView('list');
        setEditingPost(null);
    };

    const handleCancel = () => {
        setCurrentView('list');
        setEditingPost(null);
        setViewingPost(null);
    };

    const handleDelete = (postId) => {
        // Refresh the posts list
        fetchPosts();
        if (editingPost && editingPost.id === postId) {
            setCurrentView('list');
            setEditingPost(null);
        }
    };

    const handleStatusChange = (postId, newStatus) => {
        // Update local state immediately for better UX
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === postId ? { ...post, status: newStatus } : post
            )
        );
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when searching
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const columnsForExport = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Title', accessor: 'title' },
        { Header: 'Author', accessor: 'author' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'Publish Date', accessor: 'publishDate' },
    ];

    if (currentView === 'edit') {
        return (
            <BlogEditor
                post={editingPost}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
            />
        );
    }

    if (currentView === 'view') {
        return (
            <BlogPostViewModal
                post={viewingPost}
                onClose={handleCancel}
            />
        );
    }

    return (
        <div className="space-y-6">
            <TableControls
                title="Blog Posts"
                onSearch={handleSearch}
                exportData={posts}
                exportColumns={columnsForExport}
                actionButton={
                    <Button onClick={handleAddNew} variant="primary">
                        Add New Post
                    </Button>
                }
            />
            
            <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryStart"></div>
                        <span className="ml-2 text-slate-600">Loading posts...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="text-slate-400 mb-4">
                            {renderIcon(ICONS?.file, 'w-16 h-16', '📄')}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No blog posts found</h3>
                        <p className="text-slate-500 mb-4">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first blog post'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={handleAddNew} variant="primary">
                                Create First Post
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Author</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Views</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {posts.map(post => (
                                    <tr key={post.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                                        <td className="p-4 font-semibold text-slate-800">
                                            <div className="flex items-center space-x-3">
                                                {post.featuredImage && (
                                                    <img 
                                                        src={post.featuredImage} 
                                                        alt={post.title} 
                                                        className="w-10 h-10 object-cover rounded-md"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{post.title}</div>
                                                    {post.slug && (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            /{post.slug}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">{post.author}</td>
                                        <td className="p-4">
                                            <StatusBadge 
                                                status={post.status} 
                                                postId={post.id}
                                                onStatusChange={handleStatusChange}
                                            />
                                        </td>
                                        <td className="p-4">
                                            {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : 'Not published'}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-slate-600">{post.views || 0}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-1">
                                                {/* View Button */}
                                                <button 
                                                    onClick={() => handleView(post)} 
                                                    className="p-2 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors"
                                                    title="View"
                                                >
                                                    {renderIcon(ICONS?.eye, 'w-4 h-4', '👁️')}
                                                </button>
                                                {/* Edit Button */}
                                                <button 
                                                    onClick={() => handleEdit(post)} 
                                                    className="p-2 text-slate-500 hover:text-primaryEnd rounded-md hover:bg-slate-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    {renderIcon(ICONS?.edit, 'w-4 h-4', '✏️')}
                                                </button>
                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
                                                            blogService.deleteBlogPost(post.id)
                                                                .then(() => {
                                                                    toast.success('Blog post deleted successfully!');
                                                                    fetchPosts();
                                                                })
                                                                .catch(error => {
                                                                    console.error('Error deleting blog post:', error);
                                                                    toast.error('Failed to delete blog post');
                                                                });
                                                        }
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-coral rounded-md hover:bg-slate-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    {renderIcon(ICONS?.trash, 'w-4 h-4', '🗑️')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="mt-6">
                    <AdminPagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            )}
        </div>
    );
};

export default BlogManagementPage;