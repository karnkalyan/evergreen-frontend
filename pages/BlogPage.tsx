import React, { useState, useEffect } from 'react';
import { publicBlogService } from '../lib/blogService';
import BlogCard from '../components/blog/BlogCard';
import { toast } from 'react-hot-toast';

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

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogPosts = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const response = await publicBlogService.getBlogPosts({
        page,
        limit: 9, // Show 9 posts per page for 3x3 grid
        search,
        sortBy: 'publishDate',
        sortOrder: 'desc',
        status: 'published' // Only fetch published posts
      });

      if (response && response.posts) {
        setPosts(response.posts);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogPosts(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-4 text-center" data-aos="fade-down">
          <h1 className="text-5xl font-serif font-bold text-slate-900">Health & Wellness Blog</h1>
          <p className="text-xl mt-4 max-w-3xl mx-auto text-slate-600">
            Stay informed with the latest articles and tips from our healthcare experts.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-slate-400 hover:text-primaryStart" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryStart"></div>
              <span className="ml-3 text-slate-600 text-lg">Loading blog posts...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v12m0 0h6m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-2">No blog posts found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm 
                  ? 'No posts match your search criteria. Try different keywords.' 
                  : 'No blog posts available at the moment. Please check back later.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="text-primaryEnd font-semibold hover:text-primaryStart transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Search Results Info */}
              {searchTerm && (
                <div className="mb-8 text-center">
                  <p className="text-slate-600">
                    Found {posts.length} post{posts.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="text-primaryEnd font-semibold hover:text-primaryStart transition-colors mt-2"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {/* Blog Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((article, index) => (
                  <BlogCard key={article.id} article={article} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        currentPage === page
                          ? 'bg-primaryStart text-white border-primaryStart'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;