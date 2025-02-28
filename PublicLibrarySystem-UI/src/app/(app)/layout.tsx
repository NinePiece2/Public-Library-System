import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Link from 'next/link';
import LogoutButton from "@/components/LogoutButton";

const poppins = Poppins({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Public Library System",
  description: "Public Library System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <header className="text-gray-600 body-font">
          <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
            <Link href="/" style={{color: "#4CAF50"}} className="flex title-font font-medium items-center mb-4 md:mb-0">
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
            <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400 flex flex-wrap items-center text-base justify-center">
              <Link href="/" className="mr-5 hover:text-gray-900">First Link</Link>
              <Link href="/" className="mr-5 hover:text-gray-900">Second Link</Link>
              <Link href="/" className="mr-5 hover:text-gray-900">Third Link</Link>
              <Link href="/" className="mr-5 hover:text-gray-900">Fourth Link</Link>
            </nav>
            <LogoutButton />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
