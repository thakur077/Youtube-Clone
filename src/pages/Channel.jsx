import { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { Link } from "react-router-dom";
import videosData from "../data/videos";
import api from "../lib/api";

export default function Channel() {
  const { user, token } = useAuth();
  const [channelVideos, setChannelVideos] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", tags: "" });
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelForm, setChannelForm] = useState({ name: "", description: "" });
  const [channelError, setChannelError] = useState("");
  const [channelLoading, setChannelLoading] = useState(false);

  // Debug authentication
  console.log("Channel component - user:", user);
  console.log("Channel component - token:", token ? "Present" : "Missing");

  // Get channel name from user (using username as channel name for simplicity)
  const channelName = user?.username || "My Channel";

  useEffect(() => {
    // Filter videos that belong to this channel using channelOwner field
    const userVideos = videosData.filter(video => 
      video.channelOwner === user?.username
    );
    setChannelVideos(userVideos);
  }, [user]);

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      tags: video.tags ? video.tags.join(", ") : ""
    });
  };

  const handleSaveEdit = () => {
    if (!editingVideo) return;

    // Update the video in the local state (in a real app, this would be an API call)
    setChannelVideos(prev => 
      prev.map(video => 
        video.id === editingVideo.id 
          ? {
              ...video,
              title: editForm.title,
              tags: editForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag)
            }
          : video
      )
    );

    setEditingVideo(null);
    setEditForm({ title: "", tags: "" });
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      setChannelVideos(prev => prev.filter(video => video.id !== videoId));
    }
  };

  const handleCancelEdit = () => {
    setEditingVideo(null);
    setEditForm({ title: "", tags: "" });
  };

  const handleCreateChannel = async () => {
    if (!channelForm.name.trim()) {
      setChannelError("Channel name is required");
      return;
    }

    setChannelError("");
    setChannelLoading(true);

    try {
      console.log("Creating channel with data:", {
        name: channelForm.name,
        description: channelForm.description
      });
      
      const { data } = await api.post("/channels", {
        name: channelForm.name,
        description: channelForm.description
      });
      
      console.log("Channel creation response:", data);
      alert(`Channel "${data.channel.name}" created successfully!`);
      setShowCreateChannel(false);
      setChannelForm({ name: "", description: "" });
      
      // Refresh the page to show updated channel info
      window.location.reload();
    } catch (error) {
      console.error("Channel creation error:", error);
      console.error("Error response:", error.response);
      setChannelError(error.response?.data?.message || "Failed to create channel");
    } finally {
      setChannelLoading(false);
    }
  };

  const handleCancelCreateChannel = () => {
    setShowCreateChannel(false);
    setChannelForm({ name: "", description: "" });
  };

  if (!user) {
    return (
      <div className="pt-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Channel Access Required</h1>
        <p className="text-zinc-400 mb-6">You need to be signed in to access your channel.</p>
        <p className="text-zinc-500 mb-4">Debug: User = {user ? "Present" : "Missing"}, Token = {token ? "Present" : "Missing"}</p>
        <Link 
          to="/login" 
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-6">
      {/* Channel Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {channelName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{channelName}</h1>
            <p className="text-zinc-400">{channelVideos.length} videos</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
            Upload Video
          </button>
          <button 
            onClick={() => setShowCreateChannel(true)}
            className="border border-zinc-700 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Channel
          </button>
          <button className="border border-zinc-700 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg transition-colors">
            Customize Channel
          </button>
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
        
        {channelVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No videos yet</h3>
            <p className="text-zinc-400 mb-4">Start building your channel by uploading your first video.</p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
              Upload Video
            </button>
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
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleEditVideo(video)}
                      className="bg-black/70 hover:bg-black/90 text-white p-1.5 rounded transition-colors"
                      title="Edit video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="bg-black/70 hover:bg-red-600/90 text-white p-1.5 rounded transition-colors"
                      title="Delete video"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4">Edit Video</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  placeholder="Music, Gaming, Education"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 border border-zinc-700 hover:bg-zinc-800 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800">
            <h3 className="text-lg font-semibold mb-4">Create New Channel</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Channel Name</label>
                <input
                  type="text"
                  value={channelForm.name}
                  onChange={(e) => setChannelForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  placeholder="Enter channel name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={channelForm.description}
                  onChange={(e) => setChannelForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 h-20 resize-none"
                  placeholder="Describe your channel"
                />
              </div>
              {channelError && (
                <div className="text-red-400 text-sm">{channelError}</div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateChannel}
                disabled={channelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-2 rounded-lg transition-colors"
              >
                {channelLoading ? "Creating..." : "Create Channel"}
              </button>
              <button
                onClick={handleCancelCreateChannel}
                className="flex-1 border border-zinc-700 hover:bg-zinc-800 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
