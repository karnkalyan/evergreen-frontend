// components/blog/ShareButton.tsx
import React, { useState } from 'react';
import { blogInteractionService } from '../../lib/blogInteractionService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface ShareButtonProps {
  postId: number;
  postTitle: string;
  postUrl: string;
  initialShares: number;
  onShareUpdate?: (newShares: number) => void;
  disabled?: boolean; // NEW: Add disabled prop
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  postId, 
  postTitle, 
  postUrl, 
  initialShares, 
  onShareUpdate,
  disabled = false // NEW: Default to false
}) => {
  const { isAuthenticated } = useAuth();
  const [shares, setShares] = useState(initialShares);
  const [isLoading, setIsLoading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(postTitle)}`,
      platform: 'facebook'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`,
      platform: 'twitter'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      platform: 'linkedin'
    },
    {
      name: 'WhatsApp',
      icon: '💚',
      url: `https://wa.me/?text=${encodeURIComponent(postTitle + ' ' + postUrl)}`,
      platform: 'whatsapp'
    },
    {
      name: 'Copy Link',
      icon: '🔗',
      platform: 'copy'
    }
  ];

  const handleShare = async (platform: string, shareUrl?: string) => {
    if (disabled) return; // NEW: Prevent action if disabled
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
        trackShare('copy');
      } catch (error) {
        console.error('Failed to copy link:', error);
        toast.error('Failed to copy link');
      }
      setShowShareOptions(false);
      return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      trackShare(platform);
    }
    
    setShowShareOptions(false);
  };

  const trackShare = async (platform: string) => {
    if (!isAuthenticated || disabled) { // NEW: Check disabled state
      // Still allow sharing but don't track for non-authenticated users
      return;
    }

    try {
      setIsLoading(true);
      const response = await blogInteractionService.shareBlogPost(postId, platform);
      if (response.success) {
        setShares(response.data.shares);
        onShareUpdate?.(response.data.shares);
      }
    } catch (error) {
      console.error('Error tracking share:', error);
      // Don't show error to user as sharing still worked
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Show disabled state
  if (disabled) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 text-slate-300 opacity-50 cursor-not-allowed"
        title="Share functionality disabled"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>{shares}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        disabled={isLoading}
        className={`flex items-center space-x-2 transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer text-slate-500 hover:text-primaryStart'
        }`}
        title="Share this post"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>{shares}</span>
      </button>

      {/* Share Options Dropdown */}
      {showShareOptions && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Share via</h3>
            {shareOptions.map((option) => (
              <button
                key={option.platform}
                onClick={() => handleShare(option.platform, option.url)}
                className="flex items-center space-x-3 w-full p-2 text-left rounded-md hover:bg-slate-50 transition-colors"
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm text-slate-700">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {showShareOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareOptions(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;