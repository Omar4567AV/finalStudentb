"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OtpVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("pending_otp_email");
    if (!savedEmail) {
      router.push("/login");
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (otp.length !== 6) {
      setError("Please input a valid 6-digit passcode string.");
      setLoading(false);
      return;
    }

    try {
      const expectedCode = sessionStorage.getItem("expected_dev_code");
      const pendingUid = sessionStorage.getItem("pending_otp_uid"); // Grab the temporary UID from login

      if (otp === expectedCode) {
        setSuccess("Identity verified! Provisioning system session keys...");
        
        // 🔑 THE FIX: Call your session creator backend to set the secure httpOnly cookie!
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: pendingUid, email: email }),
        });

        if (sessionRes.ok) {
          // Clear temp variables now that the real secure cookie is active
          sessionStorage.removeItem("pending_otp_email");
          sessionStorage.removeItem("pending_otp_uid");
          sessionStorage.removeItem("expected_dev_code");

          // Safely push to root dashboard workspace
          router.push("/");
          router.refresh(); 
        } else {
          setError("Failed to create secure session token cookie.");
        }
      } else {
        setError("Invalid validation code. Double-check your inbox and try again.");
      }
    } catch (err: any) {
      setError("An operational failure occurred during sync validation execution.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("A brand new security code has been routed to your inbox!");
        if (data.devCode) {
          sessionStorage.setItem("expected_dev_code", data.devCode);
        }
      } else {
        setError(data.error || "Failed to trigger resend dispatch.");
      }
    } catch (err) {
      setError("Could not reconnect to mail stream channel node.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 font-sans text-black dark:bg-black dark:text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Security Check</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            We sent a 6-digit passcode confirmation profile to: <br />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verification Passcode</label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="h-12 w-full text-center text-xl font-mono tracking-[8px] rounded-xl border border-zinc-200 bg-transparent px-3 outline-none focus:border-black dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>}
          {success && <p className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/30 p-2.5 rounded-lg border border-green-100 dark:border-green-900/30">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-black font-medium text-white text-sm dark:bg-zinc-50 dark:text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Verifying..." : "Confirm & Continue"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <button
            onClick={handleResendOtp}
            type="button"
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white font-medium underline underline-offset-4"
          >
            Didn't receive a code? Resend Email
          </button>
        </div>
      </div>
    </div>
  );
}