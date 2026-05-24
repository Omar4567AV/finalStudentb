"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserSession {
  uid: string;
  email: string;
  role: "admin" | "student";
}

interface FirestoreUser {
  uid: string;
  email: string;
  role: "admin" | "student";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [allUsers, setAllUsers] = useState<FirestoreUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoadingUid, setActionLoadingUid] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    auth.authStateReady().then(() => {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          router.push("/login");
          setLoading(false);
          return;
        }

        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnapshot = await getDoc(userRef);
          const ADMIN_UID = "YUAgwW55qdZnrw4yX2KfDAlajVg2";
          const role: "admin" | "student" = firebaseUser.uid === ADMIN_UID
            ? "admin"
            : userSnapshot.exists()
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
    });

    return () => unsubscribe?.();
  }, [router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAllUsers();
    }
  }, [user]);

  async function fetchAllUsers() {
    setUsersLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((d) => ({
        uid: d.id,
        email: d.data().email ?? "",
        role: (d.data().role as "admin" | "student") || "student",
      }));
      setAllUsers(users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleRoleChange(uid: string, newRole: "admin" | "student") {
    setActionLoadingUid(uid);
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setAllUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setActionLoadingUid(null);
    }
  }

  async function handleDeleteUser(uid: string) {
    if (!confirm("Delete this user's data from Firestore?")) return;
    setActionLoadingUid(uid);
    try {
      await deleteDoc(doc(db, "users", uid));
      setAllUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setActionLoadingUid(null);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-t-white" />
      </div>
    );
  }

  const adminCount = allUsers.filter((u) => u.role === "admin").length;
  const studentCount = allUsers.filter((u) => u.role === "student").length;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 font-sans text-black dark:bg-black dark:text-zinc-100 sm:p-10">
      <div className="mx-auto max-w-5xl">

        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Main Portal Workspace</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Logged in as:{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user?.email}</span>
              <span className="ml-2 inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 uppercase">
                {user?.role}
              </span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="self-start rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Sign Out
          </button>
        </header>

        <main className="flex flex-col gap-6">

          <section className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">General Portal Feed</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Core operational feeds accessible to all active accounts.</p>
          </section>

          {user?.role === "student" && (
            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-950/30 dark:bg-zinc-950">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Student Portal Features</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Curriculum reports and academic schedules are active.</p>
            </section>
          )}

          {user?.role === "admin" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
                  <p className="text-3xl font-bold">{allUsers.length}</p>
                  <p className="mt-1 text-xs text-zinc-500 uppercase tracking-wider">Total Users</p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm dark:border-red-950/30 dark:bg-zinc-950 text-center">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{adminCount}</p>
                  <p className="mt-1 text-xs text-zinc-500 uppercase tracking-wider">Admins</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-blue-950/30 dark:bg-zinc-950 text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{studentCount}</p>
                  <p className="mt-1 text-xs text-zinc-500 uppercase tracking-wider">Students</p>
                </div>
              </div>

              {/* Users table */}
              <section className="rounded-2xl border border-red-100 bg-white shadow-sm dark:border-red-950/30 dark:bg-zinc-950">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Admin Control Panel</h2>
                  <button
                    onClick={fetchAllUsers}
                    disabled={usersLoading}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    {usersLoading ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-black dark:border-t-white" />
                  </div>
                ) : allUsers.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-zinc-400 text-center">No users found in Firestore.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-400">
                          <th className="px-6 py-3 font-medium">Email</th>
                          <th className="px-6 py-3 font-medium">Role</th>
                          <th className="px-6 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u) => (
                          <tr
                            key={u.uid}
                            className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                          >
                            <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">{u.email || u.uid}</td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase ${
                                  u.role === "admin"
                                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                {u.uid !== user?.uid ? (
                                  <>
                                    <button
                                      onClick={() => handleRoleChange(u.uid, u.role === "admin" ? "student" : "admin")}
                                      disabled={actionLoadingUid === u.uid}
                                      className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                                    >
                                      {actionLoadingUid === u.uid ? "..." : u.role === "admin" ? "Demote" : "Promote"}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u.uid)}
                                      disabled={actionLoadingUid === u.uid}
                                      className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                                    >
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-zinc-400">(you)</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
