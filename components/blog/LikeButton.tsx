// components/blog/LikeButton.tsx
import React, { useState, useEffect } from 'react';
import { blogInteractionService } from '../../lib/blogInteractionService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

interface LikeButtonProps {
  postId: number;
  initialLikes: number;
  onLikeUpdate?: (newLikes: number) => void;
  disabled?: boolean; // NEW: Add disabled prop
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  postId, 
  initialLikes, 
  onLikeUpdate,
  disabled = false // NEW: Default to false
}) => {
  const { user, isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check like status when component mounts
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!isAuthenticated || disabled) { // NEW: Check disabled state
        setIsCheckingStatus(false);
        return;
      }

      try {
        const response = await blogInteractionService.getLikeStatus(postId);
        if (response.success) {
          setIsLiked(response.data.liked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkLikeStatus();
  }, [postId, isAuthenticated, disabled]); // NEW: Add disabled to dependencies

  const handleLike = async () => {
    if (disabled) return; // NEW: Prevent action if disabled
    
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike the post
        const response = await blogInteractionService.unlikeBlogPost(postId);
        if (response.success) {
          setIsLiked(false);
          setLikes(response.data.likes);
          onLikeUpdate?.(response.data.likes);
          toast.success('Post unliked');
        }
      } else {
        // Like the post
        const response = await blogInteractionService.likeBlogPost(postId);
        if (response.success) {
          setIsLiked(true);
          setLikes(response.data.likes);
          onLikeUpdate?.(response.data.likes);
          toast.success('Post liked!');
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
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
        title="Like functionality disabled"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{likes}</span>
      </button>
    );
  }

  if (isCheckingStatus) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 text-slate-400 opacity-50 cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{likes}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-2 transition-colors ${
        isLiked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-slate-500 hover:text-red-500'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isLiked ? 'Unlike this post' : 'Like this post'}
    >
      <svg 
        className="w-5 h-5" 
        fill={isLiked ? "currentColor" : "none"} 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isLiked ? 0 : 2} 
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
        />
      </svg>
      <span>{likes}</span>
    </button>
  );
};

export default LikeButton;