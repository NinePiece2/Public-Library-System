"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") || "" : "";
  const [message, setMessage] = useState("Confirming your email...");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setMessage("Invalid confirmation link.");
      return;
    }
    const confirmEmail = async () => {
      try {
        const res = await fetch(`/api/auth/confirm-email?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          setMessage("Email confirmed successfully. You can now log in.");
        } else {
          const data = await res.json();
          setMessage(data.message || "Failed to confirm email.");
        }
      } catch (error) {
        console.error("Error confirming email:", error);
        setMessage("Error confirming email.");
      }
    };
    confirmEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Confirmation</h1>
        <p className="mb-6 text-black">{message}</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
