"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  genre: string;
  publisher: string;
  pages: number | null;
  language: string;
  description: string;
  isAvailable: boolean;
  publishedDate: string;
  imageBase64: string | null;
  imageMimeType: string | null;
}

export default function BookPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the book data on component mount
  useEffect(() => {
    if (!id) {
      setError("No book id provided in the URL.");
      setLoading(false);
      return;
    }

    const fetchBook = async () => {
      console.log("Fetching book with ID:", id);
      try {
        const res = await fetch(`/api/proxy/api/Books/GetBook/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch book.");
        }
        const data: Book = await res.json();
        setBook(data);
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("Error fetching book.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Helper function to display values or "Unknown" if data is missing
  const displayValue = (value: string | number | null | undefined | boolean) => {
    if (value == null || value === "" || (typeof value === "number" && isNaN(value))) {
      return "Unknown";
    }
    return value.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-gray-800 dark:text-gray-100">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-gray-800 dark:text-gray-100">No book found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Title */}
      <h1
        className="text-5xl font-bold mb-12 text-gray-800 dark:text-gray-100"
        style={{ fontSize: "2rem", padding: "0.5rem" }}
      >
        {displayValue(book.title)}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Fixed-Size Image Container */}
        <div className="relative w-100 h-100">
          {book.imageBase64 && book.imageMimeType ? (
            <Image
              src={`data:${book.imageMimeType};base64,${book.imageBase64}`}
              alt={book.title}
              fill
              className="object-contain rounded-lg"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-white rounded-lg"
              style={{ backgroundColor: "#0A0A0A" }}
            >
              No image available
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="flex-grow text-gray-700 dark:text-gray-300 space-y-6">
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">Author:</span> {displayValue(book.author)}
          </p>
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">ISBN:</span> {displayValue(book.isbn)}
          </p>
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">Genre:</span> {displayValue(book.genre)}
          </p>
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">Publisher:</span> {displayValue(book.publisher)}
          </p>
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">Pages:</span> {displayValue(book.pages)}
          </p>
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">Language:</span> {displayValue(book.language)}
          </p>
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">Published Date:</span>{" "}
            {new Date(book.publishedDate).toLocaleDateString() === "12/31/1969"
              ? "Unknown"
              : new Date(book.publishedDate).toLocaleDateString()}
          </p>
          <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
            <span className="font-semibold">Availability:</span>{" "}
            {book.isAvailable ? "Available" : "Not Available"}
          </p>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Description
            </h2>
            <p className="text-2xl" style={{ fontSize: "1.25rem" }}>
              {book.description ? book.description : "Unknown"}
            </p>
          </div>

          {/* Reserve Button */}
          <div className="mt-10">
            {book.isAvailable ? (
              <Button
                className="px-8 py-4 text-2xl font-semibold rounded-lg transition-colors"
                onClick={() => alert("Book reserved for 24 hours!")}
              >
                Reserve Book for 24 Hours
              </Button>
            ) : (
              <Button
                className="px-8 py-4 text-2xl font-semibold rounded-lg transition-colors"
                disabled
              >
                Book Not Available
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
