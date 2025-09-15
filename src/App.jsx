import { Routes, Route, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Header from "./Components/Header";
import Sidebar from "./Components/Sidebar";
import Filters from "./Components/Filters";
import VideoGrid from "./Components/VideoGrid";
import videosData from "./data/videos";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useSearch } from "./state/SearchContext";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const { term } = useSearch();

  const filters = ["All", "Music", "Gaming", "News", "Live", "Coding", "Podcasts", "Sports", "Movies", "Education"];

  const filteredVideos = useMemo(() => {
    const t = term.trim().toLowerCase();
    return videosData.filter((v) => {
      const okTag = activeFilter === "All" || v.tags?.includes(activeFilter);
      const okTitle = t.length === 0 || v.title.toLowerCase().includes(t);
      return okTag && okTitle;
    });
  }, [activeFilter, term]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      <div className="relative flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="w-full min-h-[calc(100vh-56px)] pt-16 px-6 pb-8 lg:ml-60">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Filters filters={filters} active={activeFilter} onChange={setActiveFilter} />
                  <VideoGrid videos={filteredVideos} />
                </>
              }
            />
            <Route path="/login" element={<LoginLazy />} />
            <Route path="/register" element={<RegisterLazy />} />
            <Route path="/video/:id" element={<VideoPageLazy />} />
            <Route path="/channel/:channelId" element={<PublicChannelLazy />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfileLazy />} />
              <Route path="/channel" element={<ChannelLazy />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

import { lazy, Suspense } from "react";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const VideoPage = lazy(() => import("./pages/VideoPage"));
const Channel = lazy(() => import("./pages/Channel"));
const PublicChannel = lazy(() => import("./pages/PublicChannel"));

function LoginLazy() { return <Suspense fallback={<div className="pt-6">Loading...</div>}><Login /></Suspense>; }
function RegisterLazy() { return <Suspense fallback={<div className="pt-6">Loading...</div>}><Register /></Suspense>; }
function ProfileLazy() { return <Suspense fallback={<div className="pt-6">Loading...</div>}><Profile /></Suspense>; }
function VideoPageLazy() { return <Suspense fallback={<div className="pt-6">Loading...</div>}><VideoPage /></Suspense>; }
function ChannelLazy() { return <Suspense fallback={<div className="pt-6">Loading...</div>}><Channel /></Suspense>; }
function PublicChannelLazy() { return <Suspense fallback={<div className="pt-6">Loading...</div>}><PublicChannel /></Suspense>; }

