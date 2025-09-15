import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import videosData from "../data/videos";

export default function PublicChannel() {
  const { channelId } = useParams();
  const [channelVideos, setChannelVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);

  useEffect(() => {
    // Find videos for this channel
    const videos = videosData.filter(video => 
      video.channelOwner === channelId || video.channel === channelId
    );
    setChannelVideos(videos);

    // Get channel info from the first video (in a real app, this would be an API call)
    if (videos.length > 0) {
      setChannelInfo({
        name: videos[0].channel,
        owner: videos[0].channelOwner,
        videoCount: videos.length,
        totalViews: videos.reduce((sum, video) => {
          const views = parseInt(video.views.replace(/[^\d]/g, ''));
          return sum + (isNaN(views) ? 0 : views);
        }, 0)
      });
    }
  }, [channelId]);

  if (!channelInfo) {
    return (
      <div className="pt-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Channel Not Found</h1>
        <p className="text-zinc-400">This channel doesn't exist or has no videos.</p>
      </div>
    );
  }

  return (
    <div className="pt-6">
      {/* Channel Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {channelInfo.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{channelInfo.name}</h1>
            <p className="text-zinc-400">
              {channelInfo.videoCount} videos • {channelInfo.totalViews.toLocaleString()} total views
            </p>
          </div>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
          Subscribe
        </button>
      </div>

      {/* Videos Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        
        {channelVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No videos yet</h3>
            <p className="text-zinc-400">This channel hasn't uploaded any videos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channelVideos.map((video) => (
              <div key={video.id} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>{video.views} views</span>
                    <div className="flex gap-1">
                      {video.tags?.map((tag, index) => (
                        <span key={index} className="bg-zinc-800 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
