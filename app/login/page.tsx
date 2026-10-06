import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import LoginForm from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already logged in → skip the login page.
  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}