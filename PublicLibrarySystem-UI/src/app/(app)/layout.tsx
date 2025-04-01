"use client";
import { useState, useEffect } from "react";
import "../globals.css";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import SearchBar from "@/components/SearchBar";
import Cookies from "js-cookie";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get the userRole cookie on the client
    const role = Cookies.get("userRole");
    setUserRole(role || null);
  }, []);

  return (
    <div>
      <header className="text-gray-600 body-font">
        <div className="container mx-auto p-5">
          {/* Top row: logo, nav, logout */}
          <div className="flex flex-wrap items-center">
            <Link
              href="/"
              style={{ color: "#4CAF50" }}
              className="flex title-font font-medium items-center mb-4 md:mb-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="w-10 h-10 text-white p-2 bg-green-500 rounded-full"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="ml-3 text-xl">Public Library System</span>
            </Link>
            <nav className="flex flex-wrap items-center text-base justify-center md:border-l md:border-gray-40 md:mr-auto md:ml-4 md:py-1 md:pl-4">
              <Link href="/" className="mr-5 hover:text-gray-900">
                Home
              </Link>
              <Link href="/Books" className="mr-5 hover:text-gray-900">
                Books
              </Link>
              <Link href="/Reservations" className="mr-5 hover:text-gray-900">
                Reservations
              </Link>
              {userRole?.toLowerCase() === "admin" && (
                <Link href="/Admin" className="mr-5 hover:text-gray-900">
                  Admin
                </Link>
              )}
            </nav>
            <LogoutButton />
          </div>

          {/* Second row: search bar */}
          <div className="mt-4">
            <SearchBar
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
            />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
