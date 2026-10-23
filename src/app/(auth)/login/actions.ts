"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  values?: {
    email?: string;
  };
};

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  // Validate
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "email" | "password";
      fieldErrors[key] = issue.message;
    }
    return { fieldErrors, values: { email } };
  }

  // Authenticate
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Never leak which part was wrong — generic message
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Invalid email or password"
          : error.message,
      values: { email },
    };
  }

  // Success — redirect outside try/catch (redirect() throws internally)
  redirect(next);
}
