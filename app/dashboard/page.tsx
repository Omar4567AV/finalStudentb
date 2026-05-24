"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserSession {
  uid: string;
  email: string;
  role: "admin" | "student";
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnapshot = await getDoc(userRef);
        const role = userSnapshot.exists()
          ? (userSnapshot.data().role as "admin" | "student") || "student"
          : "student";

        setUser({ uid: firebaseUser.uid, email: firebaseUser.email ?? "", role });
      } catch (err) {
        console.error("Firestore role fetch error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 font-sans text-black dark:bg-black dark:text-zinc-100 sm:p-10">
      <div className="mx-auto max-w-5xl">
        
        {/* Core Shared Header Panel */}
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Main Portal Workspace</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Logged in as: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user?.email}</span> 
              <span className="ml-2 inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 uppercase">
                {user?.role}
              </span>
            </p>
          </div>
          
          <button 
            onClick={() => {
              document.cookie = "portal_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/login";
            }}
            className="self-start rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Sign Out
          </button>
        </header>

        {/* Features Content Row Block */}
        <main className="grid gap-6 md:grid-cols-2">
          
          {/* Shared Content Module Card */}
          <section className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">General Portal Feed</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Core operational feeds accessible to all active accounts.</p>
          </section>

          {/* ADMIN CARD OVERLAY BLOCK */}
          {user?.role === "admin" && (
            <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm dark:border-red-950/30 dark:bg-zinc-950">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">🛡️ Administrative Control Panel</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Administrative system management dashboard access granted.</p>
            </section>
          )}

          {/* STUDENT CARD OVERLAY BLOCK */}
          {user?.role === "student" && (
            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-950/30 dark:bg-zinc-950">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">🎓 Student Portal Features</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Curriculum reports and academic schedules are active.</p>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}