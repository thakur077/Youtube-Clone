export default function Filters({ filters, active, onChange }) {
  return (
    <div className="sticky top-14 z-30 bg-zinc-950 -mx-4 px-4 py-3 border-b border-zinc-800">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {filters.map(f => {
          const isActive = active === f;
          return (
            <button
              key={f}
              onClick={() => onChange(f)}
              className={[
                "rounded-full px-4 py-2 text-sm whitespace-nowrap font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              ].join(" ")}
            >
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}
