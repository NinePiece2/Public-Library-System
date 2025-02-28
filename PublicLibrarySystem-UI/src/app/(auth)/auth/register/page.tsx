"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import Button from "@/components/Button";

const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    // Frontend validation: check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Signup failed");
        return;
      }
      // Prompt the user to confirm their email address
      router.push("/auth/register/confirmemail");

    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
        {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <InputField
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex space-x-4">
            <Button type="submit" className="w-2/3 bg-green-600 text-white hover:bg-green-700">
                Signup
            </Button>
            <Button
                type="button"
                className="w-1/3 bg-gray-300 text-gray-800 hover:bg-gray-400 flex-1"
                onClick={() => router.push("/auth/login")}
                >
                Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
