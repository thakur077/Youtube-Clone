import { useAuth } from "../state/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="pt-4">
      <h1 className="text-xl font-semibold mb-2">Profile</h1>
      <pre className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
