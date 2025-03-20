"use client";

import { useState } from "react";

export type Book = {
    id: string;
    title: string;
    author: string;
    genre: string;
    year: number;  
    available: boolean;
};

// Example of data - in a real scenario, you might fetch this from an API
const books: Book[] = [
    { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, genre: "Classic", available: true },
    { id: "2", title: "Moby Dick", author: "Herman Melville", year: 1851, genre: "Adventure", available: false },
    { id: "3", title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, genre: "Drama", available: true },
    { id: "4", title: "1984", author: "George Orwell", year: 1949, genre: "Dystopian", available: false },
];


export default function LibraryFrontPage() {
const [search, setSearch] = useState<string>("");
const [filters, setFilters] = useState<{ [key: string]: boolean }>({ 
    title: true,
    author: true,
    year: true,
    genre: true,
    available: true,
});

  // Function to handle checkbox changes
const handleFilterChange = (filter: string) => {
    setFilters((prevFilters) => ({
    ...prevFilters,
    [filter]: !prevFilters[filter],
    }));
};

  // Filter books based on selected filters and search query
const filteredBooks = books.filter((book) => {
    const searchLower = search.toLowerCase();

    // Check if any of the selected filters match the search query
    return (
    (filters.title && book.title.toLowerCase().includes(searchLower)) ||
    (filters.author && book.author.toLowerCase().includes(searchLower)) ||
    (filters.year && book.year.toString().includes(searchLower)) ||
    (filters.genre && book.genre.toLowerCase().includes(searchLower))||
    (filters.available && book.genre.toLowerCase().includes(searchLower))
    );
});

return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-black">
    <h1 className="text-4xl font-bold mb-6">Public Library</h1>
    
      {/* Library search component */}
    <div className="flex flex-col items-start mb-4">
        <input
        type="text"
        className="p-2 border rounded mb-2"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        />
        
        {/* Multiple filters with checkboxes */}
        <div className="flex space-x-4 mb-4">
        <label>
            <input
            type="checkbox"
            checked={filters.title}
            onChange={() => handleFilterChange("title")}
            />
            Title
        </label>
        <label>
            <input
            type="checkbox"
            checked={filters.author}
            onChange={() => handleFilterChange("author")}
            />
            Author
        </label>
        <label>
            <input
            type="checkbox"
            checked={filters.year}
            onChange={() => handleFilterChange("year")}
            />
            Year
        </label>
        <label>
            <input
            type="checkbox"
            checked={filters.genre}
            onChange={() => handleFilterChange("genre")}
            />
            Genre
        </label>
        <label>
            <input
            type="checkbox"
            checked={filters.available}
            onChange={() => handleFilterChange("available")}
            />
            Available
        </label>
        </div>
    </div>

      {/* Display filtered books */}
    <div className="mt-6">
        {filteredBooks.length > 0 ? (
        filteredBooks.map((book, index) => (
            <div key={index} className="border-b py-2">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p>Author: {book.author}</p>
            <p>Year: {book.year}</p>
            <p>Genre: {book.genre}</p>
            </div>
        ))
        ) : (
        <p>No books found.</p>
        )}
    </div>
    </div>
);
}