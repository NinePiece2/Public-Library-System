"use client";

export default function ConfirmEmail() {   
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Confirm Your Email</h1>
        <p style={{ color: "black" }}>
          Thank you for registering! Please check your email for a confirmation link.
          Click the link in the email to verify your account.
        </p>
      </div>
    </div>
  );
}
