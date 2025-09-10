import { useAuth } from "@/app/providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  return (
    <div className="max-w-sm mx-auto mt-24 bg-white rounded-xl shadow p-6 space-y-4">
      <h1 className="text-lg font-semibold">Admin Login</h1>
      <button
        onClick={() => { login("Admin"); nav("/"); }}
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-brand text-white"
      >
        Continue
      </button>
    </div>
  );
}
