"use client";

import { createClient } from "@/lib/supabase/client";

export default function GoogleButton() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
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
            d="M12 5.96c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.06 14.63 2.1 12 2.1a9.75 9.75 0 0 0-8.7 5.38l3.24 2.51 3.24-2.51C7.31 7.68 9.46 5.96 12 5.96Z"
          />
        </svg>

        Continue with Google
      </span>
    </button>
  );
}