import type { Metadata } from "next";
import { Poppins } from "next/font/google";
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
            <body className={`${poppins.className} antialiased`}>{children}</body>
        </html>
    );
    }