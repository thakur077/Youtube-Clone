import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useSearch } from "../state/SearchContext";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { term, setTerm } = useSearch();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 bg-zinc-950/90 backdrop-blur flex items-center gap-2 px-2">
      <button
        className="h-10 w-10 grid place-items-center rounded-full hover:bg-zinc-800/70"
        aria-label="Toggle menu"
        onClick={onToggleSidebar}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" className="fill-zinc-100">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <div className="size-4 rounded-sm bg-red-600" />
        <span className="hidden sm:inline">YouTube</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <input
          placeholder="Search by title"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-[60vw] max-w-xl rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-600"
        />
        {!user ? (
          <Link
            to="/login"
            className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-800"
          >
            Sign in
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/channel"
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-800"
            >
              My Channel
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

