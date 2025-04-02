"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

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

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [userId, setUserId] = useState<string | null>(null);

  // Reference to the carousel container
  const containerRef = useRef<HTMLDivElement>(null);

  // Fixed card dimensions and gap (in pixels)
  const cardWidth = 320; // corresponds to Tailwind w-80 (~320px)
  const gap = 24; // gap-6 = 24px
  const slideWidth = cardWidth + gap;

  // Read the cookie on client mount
  useEffect(() => {
    const cookieUserId = Cookies.get("userID");
    if (cookieUserId) {
      setUserId(cookieUserId);
    }
  }, []);

  // Fetch books from the API endpoint only after userId is available
  useEffect(() => {
    if (!userId) return;
    const fetchBooks = async () => {
      try {
        const res = await fetch(`/api/proxy/api/Books/GetRecommendedBooks?userId=${userId}`);
        const data: Book[] = await res.json();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      }
    };
    fetchBooks();
  }, [userId]);

  // Calculate the number of visible cards based on container width
  useEffect(() => {
    const updateVisibleCount = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const count = Math.floor(containerWidth / slideWidth);
        setVisibleCount(count > 0 ? count : 1);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [slideWidth]);

  // Move carousel by the number of visible cards
  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(books.length - visibleCount, 0);
      return Math.min(prev + visibleCount, maxIndex);
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - visibleCount, 0));
  };

  // If userId is not yet available, render a loading state.
  if (!userId) {
    return (
      <div className="p-8">
        <p className="text-2xl text-center">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="80vh p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
        Recommended Books
      </h1>
      <div ref={containerRef} className="relative">
        {/* Carousel container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * slideWidth}px)` }}
          >
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/Book?id=${book.id}`}
                className="bg-white rounded-lg shadow-md p-4 w-80 flex-shrink-0 mx-3"
                style={{ backgroundColor: "#121212" }}
              >
                <div className="relative h-100 w-full mb-4">
                  {book.imageBase64 && book.imageMimeType ? (
                    <Image
                      src={`data:${book.imageMimeType};base64,${book.imageBase64}`}
                      alt={book.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div
                      className="h-full w-full flex items-center justify-center text-white rounded-md"
                      style={{ backgroundColor: "#0A0A0A" }}
                    >
                      No image available
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {book.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ({book.author})
                </p>
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Published:</span>{" "}
                  {new Date(book.publishedDate).toLocaleDateString() === "12/31/1969"
                    ? "Unknown"
                    : new Date(book.publishedDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Genre:</span> {book.genre}
                </p>
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                  {book.publisher}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Prev/Next Buttons */}
        {books.length > 0 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
            >
              &lt;
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
            >
              &gt;
            </button>
          </>
        )}
      </div>
    </div>
  );
}
