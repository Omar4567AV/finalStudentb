"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // 1. Authenticate credentials against your Firebase app cloud context keys
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Transmit details onto your local server endpoint to serialize cookie sessions
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, email: user.email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Login successful! Redirecting session context to root home portal...");
        
        // 3. CORRECTED: Pull window view straight into your root layout folder page (/)
        window.location.href = "/";
      } else {
        setErrorMessage(data.error || "Failed to create an application session mapping.");
      }
    } catch (error: any) {
      console.error("Authentication submission error:", error.message);
      setErrorMessage("Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black px-4">
      <main className="w-full max-w-md rounded-2xl border border-zinc-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access your secure portal dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Input Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={loading}
              className="h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm bg-transparent outline-none transition-all focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            />
          </div>

          {/* Password Input Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={loading}
              className="h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm bg-transparent outline-none transition-all focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            />
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Form Submission Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-black font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-white dark:border-zinc-600 dark:border-t-black" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}