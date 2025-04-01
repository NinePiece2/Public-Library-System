"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/navigation";

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publisher: string;
  pages: number | null;
  language: string;
  description: string;
  isAvailable: boolean;
  publishedDate: string;
  imageBase64?: string | null;
  imageMimeType?: string | null;
}

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
}

export default function SearchBar({ search, setSearch }: SearchBarProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const router = useRouter();

  // Fetch book data from the endpoint
  useEffect(() => {
    fetch("api/proxy/api/Books")
      .then((res) => res.json())
      .then((data: Book[]) => {
        setBooks(data);
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  // Filter books based on search input when at least 3 characters are typed.
  useEffect(() => {
    if (search.length >= 3) {
      const lowerSearch = search.toLowerCase();
      const filtered = books.filter((book) => {
        const titleMatch = book.title && book.title.toLowerCase().includes(lowerSearch);
        const publisherMatch = book.publisher && book.publisher.toLowerCase().includes(lowerSearch);
        const isbnMatch = book.isbn && book.isbn.toLowerCase().includes(lowerSearch);
        return titleMatch || publisherMatch || isbnMatch;
      });
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search, books]);

  // Navigate to the Book page when a suggestion is clicked.
  const handleSuggestionClick = (book: Book) => {
    // Clear the search input first.
    setSearch("");
    router.push(`/Book?id=${book.id}`);
  };

  // Navigate to the Search page when the search button or Enter key is pressed.
  const handleSearch = () => {
    // Clear the search input first.
    setSearch("");
    router.push(`/Search?query=${encodeURIComponent(search)}`);
  };

  // Handle Enter key on the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-lg p-2 rounded-xl shadow-md">
      <div className="relative flex items-center gap-4">
        <div className="flex-grow relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full py-2 px-3 pr-10 border rounded-md border-gray-600"
              style={{ color: "white", margin: "0" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                x
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {suggestions.map((book) => (
                <li
                  key={book.id}
                  onClick={() => handleSuggestionClick(book)}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {book.imageBase64 && book.imageMimeType ? (
                    <div className="relative h-10 w-10 flex-shrink-0">
                      <Image
                        src={`data:${book.imageMimeType};base64,${book.imageBase64}`}
                        alt={book.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-700">
                      No image
                    </div>
                  )}
                  <span className="text-sm text-gray-800">
                    {book.title} ({book.author})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Button onClick={handleSearch} className="text-white px-4 py-2">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
