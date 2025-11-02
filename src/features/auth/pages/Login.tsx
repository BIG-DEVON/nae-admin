// src/features/auth/pages/Login.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuthStore } from "@/lib/store/auth.store";
import { notifyError, notifySuccess } from "@/lib/notify";

type FromState = { from?: { pathname?: string } };

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hydrate, login, loggingIn } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  // Pull any cached auth into the store on mount
  useEffect(() => {
    hydrate?.();
  }, [hydrate]);

  // If already signed in, bounce to home
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Single source of truth: store.login -> calls API once and saves token
      await login(values);

      notifySuccess("Signed in");
      const from = (location.state as FromState | null)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err?.payload?.detail ||
        err?.message ||
        "Sign in failed. Check credentials and try again.";
      notifyError(message);
    }
  };

  const disabled = isSubmitting || loggingIn;

  return (
    <div className="min-h-dvh grid place-items-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-6 pt-6">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 text-center">
              Admin Sign In
            </h1>
            <p className="mt-2 text-center text-sm text-neutral-600">
              Use the credentials configured on the server
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800">Username</label>
              <input
                {...register("username")}
                autoComplete="username"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                placeholder="Enter username"
                disabled={disabled}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-800">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-xs text-emerald-700 hover:underline"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                placeholder="Enter password"
                disabled={disabled}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {disabled ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-xs text-neutral-500">
              Your session is secured with a bearer token
            </p>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          NASME Hall of Fame Admin
        </p>
      </div>
    </div>
  );
}
