import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = ["Home", "Shorts", "Subscriptions", "Library", "History"];
  const topics = ["Music", "Gaming", "Sports", "News"];

  return (
    <>
      <aside
        className={`
          fixed z-50 top-14 bottom-0 left-0 w-60
          -translate-x-full transition-transform duration-200
          bg-zinc-950 border-r border-zinc-800 overflow-y-auto
          ${open ? "translate-x-0" : ""}
          lg:translate-x-0
        `}
        role="navigation"
        aria-label="Sidebar"
      >
        <nav className="p-2 border-b border-zinc-800">
          {items.map(label => {
            const isHome = label === "Home";
            const linkTo = isHome ? "/" : `/${label.toLowerCase()}`;
            
            return isHome ? (
              <Link
                key={label}
                to={linkTo}
                onClick={() => {
                  console.log("Home button clicked, navigating to:", linkTo);
                  console.log("Current location:", window.location.pathname);
                  onClose();
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-800/70"
              >
                <span className="size-2 rounded-sm bg-zinc-400" />
                <span>{label}</span>
              </Link>
            ) : (
              <button
                key={label}
                onClick={onClose}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-800/70"
              >
                <span className="size-2 rounded-sm bg-zinc-400" />
                <span>{label}</span>
              </button>
            );
          })}
          {user && (
            <Link
              to="/channel"
              onClick={onClose}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-800/70"
            >
              <span className="size-2 rounded-sm bg-red-500" />
              <span>My Channel</span>
            </Link>
          )}
        </nav>

        <nav className="p-2">
          {topics.map(label => (
            <button
              key={label}
              onClick={() => {
                onClose();
                // You can add filter functionality here later
                console.log(`Filter by ${label}`);
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-800/70"
            >
              <span className="size-2 rounded-sm bg-zinc-400" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
