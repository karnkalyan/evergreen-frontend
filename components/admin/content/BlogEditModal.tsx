import React, { useState } from 'react';
import CustomReactQuill from '../../shared/CustomReactQuill';
import { BlogPost } from '../../../types';
import Button from '../../shared/Button';
import SearchableSelect from '../../shared/SearchableSelect';
import ImageUploader from '../ImageUploader';

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean']
    ],
};

const BlogEditModal: React.FC<{ post?: BlogPost | null, onClose: () => void, onSave: (post: BlogPost) => void }> = ({ post, onClose, onSave }) => {
    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [author, setAuthor] = useState(post?.author || 'Admin');
    const [status, setStatus] = useState<'Published' | 'Draft'>(post?.status || 'Draft');
    const [files, setFiles] = useState<File[]>([]);
    const [content, setContent] = useState(post?.content || '');

    useEffect(() => {
        setTitle(post?.title || '');
        setSlug(post?.slug || '');
        setAuthor(post?.author || 'Admin');
        setStatus(post?.status || 'Draft');
        setContent(post?.content || '');
    }, [post]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newImageUrls = files.map(f => URL.createObjectURL(f));
        const finalImages = newImageUrls.length > 0 
            ? newImageUrls 
            : (post?.images?.length ? post.images : ['/images/article-placeholder.jpg']);

        onSave({
            id: post?.id || Date.now(),
            title,
            slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
            author,
            status: status,
            publishDate: post?.publishDate || new Date().toISOString().split('T')[0],
            images: finalImages,
            content
        });
        onClose();
    };
    
    const statusOptions = [
        { value: 'Draft', label: 'Draft' },
        { value: 'Published', label: 'Published' },
    ];

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" data-aos="zoom-in-up">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b"><h2 className="text-xl font-bold">{post ? 'Edit Post' : 'New Post'}</h2></div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <SearchableSelect options={statusOptions} value={status} onChange={(val) => setStatus(val as 'Published' | 'Draft')} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Images</label>
                            <ImageUploader 
                                onImagesChange={setFiles}
                                initialImages={post?.images}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                             <CustomReactQuill
                                key={post?.id ? `blog-${post.id}` : 'blog-new'}
                                value={content}
                                onChange={setContent}
                                modules={quillModules}
                                placeholder="Write the blog content here..."
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex justify-end space-x-2 flex-shrink-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Post</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogEditModal;