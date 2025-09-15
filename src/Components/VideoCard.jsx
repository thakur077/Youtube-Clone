import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { preloadImage, getFallbackThumbnail } from "../utils/imageUtils";

export default function VideoCard({ video }) {
  const { id, title, thumbnail, channel, views, duration, publishedAt } = video;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const published = new Date(dateString);
    const diffInSeconds = Math.floor((now - published) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  // Simple image loading without preload
  useEffect(() => {
    if (thumbnail) {
      setImageLoading(true);
      setImageError(false);
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [thumbnail, title]);

  // Generate fallback thumbnail based on video category
  const renderFallbackThumbnail = () => {
    const category = video.tags?.[0]?.toLowerCase() || 'default';
    const gradientClass = getFallbackThumbnail(category);
    
    return (
      <div className={`h-full w-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        <div className="text-center text-white">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-70" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-medium">{category.toUpperCase()}</p>
        </div>
      </div>
    );
  };

  return (
    <article className="flex flex-col gap-2">
      <Link to={`/video/${id}`} className="block rounded-lg overflow-hidden bg-zinc-900 aspect-video relative group" aria-label={title}>
        {imageError ? (
          renderFallbackThumbnail()
        ) : (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              src={thumbnail} 
              alt={title} 
              loading="lazy" 
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              onLoad={() => {
                setImageLoading(false);
              }}
              onError={(e) => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </>
        )}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            {duration}
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-[40px_1fr] gap-3">
        <img
          className="h-9 w-9 rounded-full bg-zinc-800 object-cover"
          src={`https://api.dicebear.com/8.x/identicon/svg?seed=${encodeURIComponent(channel)}`}
          alt={`${channel} avatar`}
        />
        <div className="min-w-0">
          <Link to={`/video/${id}`} className="text-sm font-medium leading-snug line-clamp-2 hover:text-white transition-colors duration-200">
            {title}
          </Link>
          <Link to={`/channel/${video.channelOwner || channel}`} className="text-xs text-zinc-400 hover:text-zinc-300 hover:underline block mt-1">
            {channel}
          </Link>
          <div className="text-xs text-zinc-400 mt-1">
            {views} • {getTimeAgo(publishedAt)}
          </div>
        </div>
      </div>
    </article>
  );
}
