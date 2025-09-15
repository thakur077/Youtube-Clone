import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import videosData from "../data/videos";
import api from "../lib/api";
import { useAuth } from "../state/AuthContext";
import VideoPlayer from "../Components/VideoPlayer";
import VideoCard from "../Components/VideoCard";

export default function VideoPage() {
  const { id } = useParams();
  const video = useMemo(() => videosData.find((v) => v.id === id), [id]);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState([]); // {id, videoId, author, text, createdAt}

  const { user } = useAuth();

  // Get related videos (exclude current video)
  const relatedVideos = useMemo(() => {
    return videosData.filter(v => v.id !== id).slice(0, 6);
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [statsRes, commentsRes] = await Promise.all([
        api.get(`/videos/${id}/stats`),
        api.get(`/videos/${id}/comments`),
      ]);
      if (!mounted) return;
      setLikes(statsRes.data.likes || 0);
      setDislikes(statsRes.data.dislikes || 0);
      setComments(commentsRes.data || []);
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const handleLike = async () => {
    const { data } = await api.post(`/videos/${id}/like`);
    setLikes(data.likes);
    setDislikes(data.dislikes);
  };
  const handleDislike = async () => {
    const { data } = await api.post(`/videos/${id}/dislike`);
    setLikes(data.likes);
    setDislikes(data.dislikes);
  };

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const { data } = await api.post(`/videos/${id}/comments`, { text });
    setComments((c) => [data, ...c]);
    setText("");
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.text);
  };

  const saveEdit = async (cid) => {
    const { data } = await api.put(`/videos/${id}/comments/${cid}`, { text: editText });
    setComments((c) => c.map((x) => (x.id === cid ? data : x)));
    setEditingId(null);
    setEditText("");
  };

  const removeComment = async (cid) => {
    await api.delete(`/videos/${id}/comments/${cid}`);
    setComments((c) => c.filter((x) => x.id !== cid));
  };

  if (!video) {
    return <div className="pt-16 px-4">Video not found</div>;
  }

  return (
    <div className="pt-16 px-4 pb-8 lg:ml-60">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Player */}
        <div>
          <VideoPlayer video={video} />

          <h1 className="mt-3 text-lg font-semibold">{video.title}</h1>
          <div className="text-sm text-zinc-400">{video.channel}</div>
          <div className="mt-2 flex items-center gap-4 text-sm text-zinc-400">
            <span>{video.views} views</span>
            <span>•</span>
            <span>{video.duration}</span>
            <span>•</span>
            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-200">
            {video.description || "No description."}
          </p>

          {/* Like/Dislike */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleLike}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-800"
            >
              👍 {likes}
            </button>
            <button
              onClick={handleDislike}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-800"
            >
              👎 {dislikes}
            </button>
          </div>

          {/* Comments */}
          <section className="mt-6">
            <h2 className="text-base font-semibold mb-3">Comments</h2>

            {/* Add comment */}
            <form onSubmit={addComment} className="mb-4 space-y-2">
              <textarea
                placeholder={!user ? "Sign in to comment" : "Add a comment"}
                disabled={!user}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 min-h-24"
              />
              <div>
                <button
                  disabled={!user || !text.trim()}
                  className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Comment
                </button>
              </div>
            </form>

            {/* List */}
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="border border-zinc-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-zinc-400">{c.author}</div>
                    <div className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>

                  {editingId === c.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 min-h-20"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditText(""); }}
                          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-100">{c.text}</p>
                  )}

                  {/* Actions (only author can edit/delete in real app; here allow if logged in) */}
                  {user && editingId !== c.id && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeComment(c.id)}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column - Related videos */}
        <aside className="hidden lg:block">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Related Videos</h3>
            <div className="space-y-3">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
