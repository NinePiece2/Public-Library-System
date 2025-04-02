"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/Button";

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  available: boolean;
  publishedDate: string;
  imageBase64?: string;
  imageMimeType?: string;
};

export default function SearchPageContent() {
  const searchParams = useSearchParams()!;
  const router = useRouter();

  const initialQuery = searchParams.get("query") || "";
  const [search, setSearch] = useState<string>(initialQuery);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state: toggle which fields to search in.
  const [filters, setFilters] = useState<{ [key: string]: boolean }>({
    title: true,
    author: true,
    year: true,
    genre: true,
    available: true,
  });

  // Time filter dropdown state
  const [timeFilter, setTimeFilter] = useState<"7days" | "14days" | "month" | "all">("all");

  const handleFilterChange = (filter: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/proxy/api/Books`);
        if (!res.ok) {
          throw new Error("Failed to fetch books");
        }
        const data: Book[] = await res.json();
        setBooks(data);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error fetching books");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Filter books based on search text and time filter
  const filteredBooks = books.filter((book) => {
    const searchLower = search.toLowerCase();

    // Check text matches
    const textMatch =
      !searchLower ||
      (filters.title && book.title.toLowerCase().includes(searchLower)) ||
      (filters.author && book.author.toLowerCase().includes(searchLower)) ||
      (filters.year &&
        (book.year !== undefined ? book.year.toString() : "").includes(searchLower)) ||
      (filters.genre && book.genre.toLowerCase().includes(searchLower)) ||
      (filters.available &&
        (book.available ? "available" : "not available").includes(searchLower));

    // Check time filter if publishedDate is available
    let timeMatch = true;
    if (timeFilter !== "all") {
      const published = new Date(book.publishedDate);
      const now = new Date();
      const diffInDays = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
      if (timeFilter === "7days") {
        timeMatch = diffInDays <= 7;
      } else if (timeFilter === "14days") {
        timeMatch = diffInDays <= 14;
      } else if (timeFilter === "month") {
        timeMatch = diffInDays <= 30;
      }
    }

    return textMatch && timeMatch;
  });

  // When the user searches, update the URL query parameter
  const handleSearch = () => {
    router.push(`/search?query=${encodeURIComponent(search)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleResultClick = (book: Book) => {
    router.push(`/Book?id=${book.id}`);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 text-white">
      <h1 className="text-5xl font-bold mb-4" style={{ fontSize: "2rem", padding: "0.5rem" }}>
        Public Library Search
      </h1>

      {/* Row for time filter dropdown */}
      <div className="w-full max-w-4xl flex justify-end mb-4">
        <select
          value={timeFilter}
          onChange={(e) =>
            setTimeFilter(e.target.value as "7days" | "14days" | "month" | "all")
          }
          className="p-2 border rounded text-2xl"
          style={{ fontSize: "1rem", padding: "0.5rem", color: "white", backgroundColor: "#121212" }}
        >
          <option value="7days">Last 7 Days</option>
          <option value="14days">Last 14 Days</option>
          <option value="month">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Search input and filters */}
      <div className="w-full max-w-4xl flex flex-col mb-6">
        {/* Row for search input and button */}
        <div className="flex items-center">
          <input
            type="text"
            className="p-3 border rounded text-2xl flex-grow"
            placeholder="Search for books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ color: "white" }}
          />
          <Button
            className="ml-4 px-6 py-3 text-2xl font-semibold rounded-lg"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
        {/* Row for filter checkboxes */}
        <div className="flex space-x-4 mt-2">
          <label className="text-2xl">
            <input
              type="checkbox"
              checked={filters.title}
              onChange={() => handleFilterChange("title")}
            />{" "}
            Title
          </label>
          <label className="text-2xl">
            <input
              type="checkbox"
              checked={filters.author}
              onChange={() => handleFilterChange("author")}
            />{" "}
            Author
          </label>
          <label className="text-2xl">
            <input
              type="checkbox"
              checked={filters.year}
              onChange={() => handleFilterChange("year")}
            />{" "}
            Year
          </label>
          <label className="text-2xl">
            <input
              type="checkbox"
              checked={filters.genre}
              onChange={() => handleFilterChange("genre")}
            />{" "}
            Genre
          </label>
          <label className="text-2xl">
            <input
              type="checkbox"
              checked={filters.available}
              onChange={() => handleFilterChange("available")}
            />{" "}
            Available
          </label>
        </div>
      </div>

      {/* Display search results */}
      {loading ? (
        <p className="text-2xl">Loading books...</p>
      ) : error ? (
        <p className="text-2xl text-red-500">{error}</p>
      ) : filteredBooks.length > 0 ? (
        <div className="w-full max-w-4xl space-y-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleResultClick(book)}
              className="flex items-center bg-white shadow rounded-lg p-4 cursor-pointer hover:bg-green-600 transition-colors"
              style={{ backgroundColor: "#121212" }}
            >
              <div className="relative w-48 h-64 flex-shrink-0">
                {book.imageBase64 && book.imageMimeType ? (
                  <Image
                    src={`data:${book.imageMimeType};base64,${book.imageBase64}`}
                    alt={book.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-64 bg-gray-500 flex items-center justify-center rounded-lg">
                    <span className="text-white text-xl">No Image</span>
                  </div>
                )}
              </div>
              <div className="ml-6 flex-grow text-center">
                <h2 className="text-3xl font-bold mb-2">{book.title}</h2>
                <p className="text-2xl mb-1">by {book.author}</p>
                <p className="text-2xl mb-1">Year: {book.year}</p>
                <p className="text-2xl mb-1">Genre: {book.genre}</p>
                <p className="text-2xl">
                  {book.available ? "Available" : "Not Available"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-2xl">No books found.</p>
      )}
    </div>
  );
}