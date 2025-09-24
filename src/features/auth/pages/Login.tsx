// src/features/auth/pages/Login.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store/auth.store";

type FromState = { from?: { pathname?: string } };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuthStore();

  // If already signed in, bounce to home
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleContinue = () => {
    // Fake auth for now — replace with real login later
    login({ id: "1", name: "Admin" });

    const from =
      (location.state as FromState | null)?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-dvh grid place-items-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-2xl font-semibold">Sign in</h1>
        <button
          onClick={handleContinue}
          className="w-full rounded-lg bg-black text-white py-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
