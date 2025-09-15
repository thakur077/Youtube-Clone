import VideoCard from "./VideoCard";

export default function VideoGrid({ videos }) {
  return (
    <section aria-label="Videos" className="mt-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {videos.map(v => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </section>
  );
}
