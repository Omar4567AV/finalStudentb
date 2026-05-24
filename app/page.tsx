// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // ✅ FIXED: Added for instant layout updates
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

interface UserSession {
  uid: string;
  email: string;
  role: "admin" | "student";
}

interface StudentListInstance {
  id: string;
  email: string;
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("portal_session");

  // 1. Enforce Server-Side Authentication
  if (!sessionCookie || !sessionCookie.value) {
    redirect("/login");
  }

  let user: UserSession | null = null;
  let students: StudentListInstance[] = [];

  try {
    user = JSON.parse(decodeURIComponent(sessionCookie.value));

    // 2. If the logged-in account is an admin, pull all current students from Firestore
    if (user?.role === "admin") {
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role === "student") {
          students.push({
            id: docSnap.id,
            email: data.email || "No email assigned",
          });
        }
      });
    }
  } catch (err) {
    console.error("Failed to parse secure server session:", err);
    redirect("/login");
  }

  // --- SERVER ACTIONS (Admin Management Functions) ---

  // Action to add a new student role mapping record
  async function addStudentAction(formData: FormData) {
    "use server";
    const studentUid = formData.get("uid") as string;
    const studentEmail = formData.get("email") as string;

    if (!studentUid || !studentEmail) return;

    try {
      const docRef = doc(db, "users", studentUid.trim());
      await setDoc(docRef, {
        email: studentEmail.trim(),
        role: "student",
      });
      
      // ✅ FIXED: Force cache clearing for instant visual UI updates
      revalidatePath("/");
    } catch (error) {
      console.error("Failed to add student to Firestore:", error);
    }
    
    redirect("/"); 
  }

  // Action to completely remove a student role mapping document
  async function removeStudentAction(formData: FormData) {
    "use server";
    const targetUid = formData.get("targetUid") as string;

    if (!targetUid) return;

    try {
      await deleteDoc(doc(db, "users", targetUid));
      
      // ✅ FIXED: Force cache clearing for instant visual UI updates
      revalidatePath("/");
    } catch (error) {
      console.error("Failed to eliminate student record from Firestore:", error);
    }

    redirect("/"); 
  }

  // Action to clear out cookies and sign out
  async function signOutAction() {
    "use server";
    const c = await cookies();
    c.delete("portal_session");
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 font-sans text-black dark:bg-black dark:text-zinc-100 sm:p-10">
      <div className="mx-auto max-w-5xl">
        
        {/* Core Global Application Header */}
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
          
          <form action={signOutAction}>
            <button 
              type="submit"
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              Sign Out
            </button>
          </form>
        </header>

        {/* Operational Modules Component Framework */}
        <main className="flex flex-col gap-8">
          
          {/* SHARED MODULE CARD */}
          <section className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">General Announcements</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Core system communications stream showing general institution updates.
            </p>
          </section>

          {/* DYNAMIC CASE 1: ADMINISTRATOR MANAGEMENT VIEW */}
          {user?.role === "admin" && (
            <div className="grid gap-6 md:grid-cols-3">
              
              {/* Add Student Control Input Panel Block */}
              <section className="md:col-span-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  ➕ Add New Student
                </h2>
                <form action={addStudentAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Student UID</label>
                    <input 
                      name="uid" 
                      type="text" 
                      placeholder="Paste User Firebase UID" 
                      required 
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm bg-transparent outline-none dark:border-zinc-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Email Address</label>
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="student@example.com" 
                      required 
                      className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm bg-transparent outline-none dark:border-zinc-800"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="mt-2 h-10 w-full rounded-lg bg-black font-medium text-white text-sm dark:bg-zinc-50 dark:text-black hover:opacity-90"
                  >
                    Authorize Student
                  </button>
                </form>
              </section>

              {/* Live Firestore Directory Monitor List with Removals */}
              <section className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  👥 Authorized Student Directory ({students.length})
                </h2>
                {students.length === 0 ? (
                  <p className="text-sm text-zinc-400 py-4 italic">No active student records registered inside database collection storage modules.</p>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
                    {students.map((student) => (
                      <div 
                        key={student.id} 
                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
                      >
                        <div className="flex flex-col truncate mr-2">
                          <span className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-200">{student.email}</span>
                          <span className="text-xs font-mono text-zinc-400 truncate">UID: {student.id}</span>
                        </div>
                        
                        <form action={removeStudentAction}>
                          <input type="hidden" name="targetUid" value={student.id} />
                          <button 
                            type="submit"
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60 transition-colors"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* DYNAMIC CASE 2: STANDARD STUDENT PORTAL MODULE VIEW */}
          {user?.role === "student" && (
            <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-950/30 dark:bg-zinc-950">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                🎓 Student Portal Features
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Your assigned academic courses, personal profile matrices, and student materials are active.
              </p>
              <div className="mt-4">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700">
                  Open Assignments Desk
                </button>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}