import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicBlogService } from '../lib/blogService';
import { blogInteractionService } from '../lib/blogInteractionService';
import BlogCard from '../components/blog/BlogCard';
import LikeButton from '../components/blog/LikeButton';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle, // Using for WhatsApp
  Link2, // Using for Copy Link
  ChevronDown,
} from 'lucide-react'; // Corrected package name

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  status: string;
  publishDate: string;
  featuredImage: string;
  images: string[];
  views: number;
  likes: number;
  shares: number;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  seoKeywords: string;
  createdAt: string;
  updatedAt: string;
}

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // This is a BOOLEAN, not a function
  const { isAuthenticated } = useAuth(); 
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  // Fetch the specific blog post
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        const response = await publicBlogService.getBlogPostBySlug(slug);
        
        if (response && response.id) {
          setPost(response);
          // SEO is now handled by Helmet component
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  // Fetch related posts
  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!post) return;
      try {
        setIsLoadingRelated(true);
        const response = await publicBlogService.getBlogPosts({
          page: 1, limit: 3, status: 'published', sortBy: 'publishDate', sortOrder: 'desc'
        });
        if (response && response.posts) {
          const filteredPosts = response.posts
            .filter(p => p.id !== post.id)
            .slice(0, 3);
          setRelatedPosts(filteredPosts);
        }
      } catch (error) {
        console.error('Error fetching related posts:', error);
        setRelatedPosts([]);
      } finally {
        setIsLoadingRelated(false);
      }
    };
    fetchRelatedPosts();
  }, [post]);

  // Handle like update
  const handleLikeUpdate = (newLikes: number) => {
    setPost(prev => prev ? { ...prev, likes: newLikes } : null);
  };

  // Handle share update
  const handleShareUpdate = (newShares: number) => {
    setPost(prev => prev ? { ...prev, shares: newShares } : null);
  };

  /**
   * Helper to track share click, update count, and open popup
   */
  const handleShareClick = (platform: string) => {
    // FIX: Removed parentheses from isAuthenticated
    if (!post || !isAuthenticated) return;

    // Track the share
    try {
      blogInteractionService.shareBlogPost(post.id, platform);
      // Optimistically update the share count
      handleShareUpdate((post.shares || 0) + 1);
    } catch (error){
      console.error('Error tracking share:', error);
    }
  };

  /**
   * handleCopyLink now also tracks and updates share count
   */
  const handleCopyLink = async () => {
    if (!post) return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
      
      // Track the share if user is authenticated
      // FIX: Removed parentheses from isAuthenticated
      if (isAuthenticated) {
        handleShareClick('copy');
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  // Helper for Share URLs
  const getShareUrls = (post: BlogPost) => {
    const url = window.location.href;
    const title = post.title;
    const excerpt = post.excerpt;
    
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedExcerpt = encodeURIComponent(excerpt);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`,
    };
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryStart mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading blog post...</p>
      </div>
    );
  }

  // Not Found State
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-slate-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-serif font-bold text-slate-900">Post Not Found</h1>
        <p className="text-slate-600 mt-4">We couldn't find the blog post you were looking for.</p>
        <Link 
          to="/blog" 
          className="text-primaryEnd font-semibold mt-8 inline-block hover:text-primaryStart transition-colors"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  // Get share URLs
  const shareUrls = getShareUrls(post);

  // Render Page
  return (
    <>
      <Helmet>
        <title>{post?.metaTitle || `${post?.title} | Health & Wellness Blog`}</title>
        <meta name="description" content={post?.metaDescription || post?.excerpt} />
        {post?.canonicalUrl && <link rel="canonical" href={post.canonicalUrl} />}
        <meta property="og:title" content={post?.metaTitle || post?.title} />
        <meta property="og:description" content={post?.metaDescription || post?.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {post?.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post?.metaTitle || post?.title} />
        <meta name="twitter:description" content={post?.metaDescription || post?.excerpt} />
        {post?.featuredImage && <meta name="twitter:image" content={post.featuredImage} />}
        {post?.seoKeywords && <meta name="keywords" content={post.seoKeywords} />}
      </Helmet>
      <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link 
              to="/blog" 
              className="text-primaryEnd font-semibold hover:text-primaryStart transition-colors"
            >
              ← Back to Blog
            </Link>
          </nav>

          <article>
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-slate-500 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <span>By {post.author}</span>
                  <span className="hidden sm:inline">&bull;</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>
                    {new Date(post.publishDate).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </span>
                  <span>&bull;</span>
                  <span>{post.views || 0} views</span>
                </div>
              </div>
            </header>
            
            {/* Featured Image */}
            {post.featuredImage && (
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-auto rounded-2xl shadow-lg mb-8 max-h-100 object-cover"
              />
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="bg-slate-50 border-l-4 border-primaryStart p-6 mb-8 rounded-r-lg">
                <p className="text-lg text-slate-700 italic">{post.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div 
              className="prose lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Stats and Interaction Buttons */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center space-x-6">
              
                {/* --- LIKE BUTTON (FIXED) --- */}
                <LikeButton 
                  postId={post.id}
                  initialLikes={post.likes || 0}
                  onLikeUpdate={handleLikeUpdate}
                  // FIX: Removed parentheses
                  disabled={!post || !isAuthenticated} 
                />
                
                {/* --- SHARE MENU (FIXED) --- */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger
                    // FIX: Removed parentheses
                    disabled={!post || !isAuthenticated}
                    className="flex items-center space-x-2 text-slate-500 hover:text-primaryStart transition-colors data-[disabled]:opacity-50 data-[disabled]:hover:text-slate-500"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.shares || 0}</span>
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      sideOffset={5}
                      align="start"
                      className="bg-white rounded-lg shadow-lg border border-slate-200 p-2 min-w-[180px] z-50 animate-in fade-in-0 zoom-in-95"
                    >
                      {/* Share on Twitter */}
                      <DropdownMenu.Item asChild>
                        <a
                          href={shareUrls.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleShareClick('twitter')}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100 hover:text-primaryStart cursor-pointer outline-none"
                        >
                          <Twitter className="w-4 h-4" />
                          <span>Share on Twitter</span>
                        </a>
                      </DropdownMenu.Item>

                      {/* Share on Facebook */}
                      <DropdownMenu.Item asChild>
                        <a
                          href={shareUrls.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleShareClick('facebook')}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100 hover:text-primaryStart cursor-pointer outline-none"
                        >
                          <Facebook className="w-4 h-4" />
                          <span>Share on Facebook</span>
                        </a>
                      </DropdownMenu.Item>

                      {/* Share on LinkedIn */}
                      <DropdownMenu.Item asChild>
                        <a
                          href={shareUrls.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleShareClick('linkedin')}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100 hover:text-primaryStart cursor-pointer outline-none"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>Share on LinkedIn</span>
                        </a>
                      </DropdownMenu.Item>
                      
                      {/* Share on WhatsApp */}
                      <DropdownMenu.Item asChild>
                        <a
                          href={shareUrls.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-action="share/whatsapp/share" // For mobile
                          onClick={() => handleShareClick('whatsapp')}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100 hover:text-primaryStart cursor-pointer outline-none"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Share on WhatsApp</span>
                        </a>
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />

                      {/* Copy Link */}
                      <DropdownMenu.Item
                        onSelect={handleCopyLink} // Use onSelect for Radix Dropdown items
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100 hover:text-primaryStart cursor-pointer outline-none"
                      >
                        <Link2 className="w-4 h-4" />
                        <span>Copy Link</span>
                      </DropdownMenu.Item>

                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>

              </div>
              
              <div className="text-sm text-slate-500">
                Last updated: {new Date(post.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Tags/Categories Section */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-sm text-slate-500">Tags:</span>
              {post.seoKeywords && post.seoKeywords.split(',').map((keyword, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </article>

          {/* Author Bio Section */}
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primaryStart rounded-full flex items-center justify-center text-white font-semibold">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">About {post.author}</h3>
                <p className="text-slate-600 text-sm mt-1">
                  Healthcare professional and wellness expert sharing insights on health, medicine, and lifestyle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Posts */}
      {(relatedPosts.length > 0 || isLoadingRelated) && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-poppins font-bold text-slate-900 mb-8 text-center">
              Related Articles
            </h2>
            
            {isLoadingRelated ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryStart"></div>
                <span className="ml-2 text-slate-600">Loading related posts...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {relatedPosts.map((article, index) => (
                  <BlogCard key={article.id} article={article} index={index} />
                ))}
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center mt-12">
              <Link 
                to="/blog"
                className="inline-flex items-center space-x-2 bg-primaryStart text-white px-6 py-3 rounded-lg hover:bg-primaryEnd transition-colors font-semibold"
              >
                <span>View All Blog Posts</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="py-16 bg-primaryStart text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Health Tips</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Get the latest health articles, wellness tips, and medical insights delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex space-x-2">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-primaryStart px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default BlogDetailPage;