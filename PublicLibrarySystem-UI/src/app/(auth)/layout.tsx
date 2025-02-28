import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";

export const poppins = Poppins({ weight: "400" });

export const metadata: Metadata = {
  title: "Smart Library System - Auth",
  description: "Login or Register to Smart Library System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
