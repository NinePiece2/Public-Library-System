"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import Cookies from "js-cookie";

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
        return;
      }
      const data = await res.json();

      if (!data.isEmailConfirmed) {
        router.push("/auth/register/confirmemail");
        return;
      }
      Cookies.set("token", data.token, { expires: 1, secure: true, sameSite: "strict" });
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="Username or Email"
            placeholder="Enter your username or email"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              className="bg-gray-300 text-gray-800 hover:bg-gray-400 flex-1"
              onClick={() => router.push("/auth/register")}
            >
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
