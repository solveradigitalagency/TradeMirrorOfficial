"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signup } from "./actions";
import GoogleButton from "./google-button";

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}) {

  return (
    <main className="min-h-screen bg-[#080b12] flex items-center justify-center px-6 py-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-flex items-center justify-center">
            <img
              src="/logo/trade-mirror-logo.png"
              alt="TradeMirror"
              className="h-25 w-auto object-contain"
            />
          </Link>

          <p className="mt-3 text-sm text-zinc-400">
            Your journal. Your mirror. Your edge.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-white">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Start tracking your trades and finding your edge.
            </p>
          </div>

          {/* Because searchParams is a Promise and this is now a client component, accessing params synchronously won't work.
              For now, remove all conditional error/success boxes if you are not rewriting to use URLSearchParams here. */}

          <form action={signup} className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Name
              </label>

              <input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Jake Carmona"
                required
                autoComplete="name"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="@yourusername"
                required
                autoComplete="username"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

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
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-blue-500 font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 active:scale-[0.99]"
            >
              Create Account
            </button>

            <GoogleButton />

          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-zinc-600">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          By creating an account, you agree to TradeMirror's Terms and Privacy
          Policy.
        </p>
      </div>
    </main>
  );
}