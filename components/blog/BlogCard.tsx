import React from 'react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  publishDate: string;
  featuredImage: string;
  views: number;
}

interface BlogCardProps {
  article: BlogPost;
  index: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ article, index }) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-soft-md overflow-hidden hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <Link to={`/blog/${article.slug}`}>
        {article.featuredImage && (
          <img 
            src={article.featuredImage} 
            alt={article.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-2 hover:text-primaryStart transition-colors">
            {article.title}
          </h3>
          <p className="text-slate-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>By {article.author}</span>
            <span>{new Date(article.publishDate).toLocaleDateString()}</span>
          </div>
          {article.views > 0 && (
            <div className="flex items-center mt-2 text-xs text-slate-400">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.views} views
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default BlogCard;