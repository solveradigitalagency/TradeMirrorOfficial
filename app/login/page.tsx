"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { login } from "./actions";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Add handleGoogleSignIn
  const handleGoogleSignIn = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Placeholder for error handling in client component
  // Could use URLSearchParams to grab errors from the client side if needed

  return (
    <main className="min-h-screen bg-[#080b12] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center">
            <img
              src="/logo/trade-mirror-logo.png"
              alt="TradeMirror"
              className="h-25 w-auto object-contain"
            />
          </Link>

          <p className="mt-3 text-sm text-zinc-400">
            Reflect on your trades. Find your edge.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Sign in to continue to TradeMirror.
            </p>
          </div>

          {/* 
            For actual usage, you'd likely want to show this error
            using state or URL params on the client (ex: URLSearchParams).
            Kept here as a placeholder for error feedback:
          */}
          {/* {error === "invalid" && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Invalid email or password.
            </div>
          )} */}

          <form action={login} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-200"
                >
                  Password
                </label>
                {/* Forgot password button removed */}
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" strokeWidth={1.8} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-blue-500 font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 active:scale-[0.99]"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] font-medium text-white transition hover:bg-white/[0.08] active:scale-[0.99]"
            >
              <span className="flex items-center justify-center gap-3">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.9c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.75 9.75 0 0 0 12 21.9Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.54 14.01A5.86 5.86 0 0 1 6.23 12c0-.7.12-1.38.31-2.01V7.48H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.52l3.24-2.51Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.96c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.06 14.63 2.1 12 2.1a9.75 9.75 0 0 0-8.7 5.38l3.24 2.51C7.31 7.68 9.46 5.96 12 5.96Z"
                  />
                </svg>

                Continue with Google
              </span>
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-zinc-600">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} TradeMirror
        </p>
      </div>
    </main>
  );
}