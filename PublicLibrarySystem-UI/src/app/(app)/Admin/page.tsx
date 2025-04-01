"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import Image from "next/image";
import Button from "@/components/Button";

interface User {
  id: string;
  email: string;
  roles: string; // Comma-separated list of roles, e.g. "admin,user"
}

interface Reservation {
  id: number;
  userEmail: string;
  bookTitle: string;
  reservedDate: string;
}

interface Book {
  title: string;
  author: string;
  genre: string;
  publisher: string;
  pages?: number;
  language: string;
  publishedDate: string;
  description: string;
  isAvailable: boolean;
  imageBase64?: string;
  imageMimeType?: string;
}

export default function AdminPage() {
  // USER MANAGEMENT STATE
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState(""); // expecting a single role ("user" or "admin")
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // RESERVATION MANAGEMENT STATE
  const [reservationList, setReservationList] = useState<Reservation[]>([]);

  // ADD BOOK FORM STATE
  const [bookForm, setBookForm] = useState<Book>({
    title: "",
    author: "",
    genre: "",
    publisher: "",
    pages: undefined,
    language: "",
    publishedDate: "",
    description: "",
    isAvailable: true,
    imageBase64: "",
    imageMimeType: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------- User Management --------------------

  const handleUserSearch = async () => {
    setUserSearchLoading(true);
    try {
      // First, get the list of users without roles
      const res = await fetch(
        `/api/proxy/api/admin/GetUsersEmails?email=${encodeURIComponent(userSearch)}`
      );
      const users: User[] = await res.json();

      // For each user, perform an additional request to get their roles
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          try {
            const resRoles = await fetch(
              `/api/proxy/api/admin/GetUser?userId=${encodeURIComponent(user.id)}`
            );
            if (resRoles.ok) {
              // The API returns an object like { user, roles: userRoles }
              const result = await resRoles.json();
              return {
                ...user,
                roles: Array.isArray(result.roles)
                  ? result.roles.join(",")
                  : result.roles,
              };
            } else {
              return user;
            }
          } catch (error) {
            console.error(`Error fetching roles for user ${user.id}`, error);
            return user;
          }
        })
      );

      setUserResults(usersWithRoles);
    } catch (error) {
      console.error("Error searching users", error);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    // Set the dropdown to "admin" if the roles string includes "admin", otherwise default to "user"
    setNewRole(user.roles.toLowerCase().includes("admin") ? "admin" : "user");
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const updateData = {
        userId: selectedUser.id,
        role: newRole, // single role: "user" or "admin"
      };
      const res = await fetch(`/api/proxy/api/admin/UpdateUserRole`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        alert("User role updated successfully!");
        // Refresh the user search data after updating
        await handleUserSearch();
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role", error);
    }
  };

  // Listen for Enter key in the search input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUserSearch();
    }
  };

  // -------------------- Reservations Management --------------------

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch(`/api/admin/reservations`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error("Unexpected response: " + text);
        }
        const data = await res.json();
        setReservationList(data);
      } catch (error) {
        console.error("Error fetching reservations", error);
      }
    };

    fetchReservations();
  }, []);

  const handleConvertReservation = async (reservationId: number) => {
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/convert`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Reservation converted to borrow successfully!");
        setReservationList((prev) => prev.filter((r) => r.id !== reservationId));
      } else {
        alert("Failed to convert reservation");
      }
    } catch (error) {
      console.error("Error converting reservation", error);
    }
  };

  // -------------------- Add Book Section --------------------

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(",")[1];
        const mimeType = imageFile.type;
        const bookData = { ...bookForm, imageBase64: base64String, imageMimeType: mimeType };

        try {
          const res = await fetch(`/api/proxy/api/books`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookData),
          });
          if (res.ok) {
            alert("Book added successfully!");
            // Clear book form state
            setBookForm({
              title: "",
              author: "",
              genre: "",
              publisher: "",
              pages: undefined,
              language: "",
              publishedDate: "",
              description: "",
              isAvailable: true,
              imageBase64: "",
              imageMimeType: "",
            });
            // Clear image file state and preview
            setImageFile(null);
            setImagePreview("");
            // Also clear the file input element's value
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else {
            alert("Failed to add book");
          }
        } catch (error) {
          console.error("Error adding book", error);
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      try {
        const res = await fetch(`/api/proxy/api/books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookForm),
        });
        if (res.ok) {
          alert("Book added successfully!");
        } else {
          alert("Failed to add book");
        }
      } catch (error) {
        console.error("Error adding book", error);
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1
        className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-8"
        style={{ fontSize: "2rem", padding: "0.5rem" }}
      >
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Management Section */}
        <section className="rounded-lg p-6" style={{ backgroundColor: "#121212" }}>
          <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            User Management
          </h2>
          <div className="mb-4">
            <input
              type="email"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by email"
              className="p-2 border rounded w-full text-2xl"
              style={{ color: "white" }}
            />
            <Button
              className="mt-2 px-4 py-2 text-2xl font-semibold rounded-lg"
              onClick={handleUserSearch}
            >
              Search
            </Button>
          </div>
          {userSearchLoading && <p className="text-2xl">Loading...</p>}
          {userResults.length > 0 && (
            <ul className="space-y-2">
              {userResults.map((user) => (
                <li
                  key={user.id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-100 text-2xl"
                  style={{ color: "white" }}
                  onClick={() => handleUserSelect(user)}
                >
                  {user.email} - Roles: {user.roles}
                </li>
              ))}
            </ul>
          )}
          {selectedUser && (
            <div className="mt-4">
              <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                Modify Roles for {selectedUser.email}
              </h3>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="p-2 border rounded text-2xl w-full"
                style={{ color: "white" }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                className="mt-2 px-4 py-2 text-2xl font-semibold rounded-lg"
                onClick={handleRoleUpdate}
              >
                Update Roles
              </Button>
            </div>
          )}
        </section>

        {/* Reservations Management Section */}
        <section className="rounded-lg p-6" style={{ backgroundColor: "#121212" }}>
          <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Reservations Management
          </h2>
          {reservationList.length === 0 ? (
            <p className="text-2xl">No reservations found.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservationList.map((reservation) => (
                <li
                  key={reservation.id}
                  className="p-4 border rounded flex flex-col justify-between"
                >
                  <div>
                    <p className="text-2xl">User: {reservation.userEmail}</p>
                    <p className="text-2xl">Book: {reservation.bookTitle}</p>
                    <p className="text-2xl">
                      Reserved: {new Date(reservation.reservedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    className="mt-4 px-4 py-2 text-2xl font-semibold rounded-lg"
                    onClick={() => handleConvertReservation(reservation.id)}
                  >
                    Convert to Borrow
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Add Book Section */}
        <section className="rounded-lg p-6" style={{ backgroundColor: "#121212" }}>
          <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Add New Book
          </h2>
          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div>
              <label className="block text-2xl font-semibold mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={bookForm.title}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
                required
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Author</label>
              <input
                type="text"
                name="author"
                value={bookForm.author}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
                required
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Genre</label>
              <input
                type="text"
                name="genre"
                value={bookForm.genre}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
                required
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Publisher</label>
              <input
                type="text"
                name="publisher"
                value={bookForm.publisher}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
                required
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Pages</label>
              <input
                type="number"
                name="pages"
                value={bookForm.pages || ""}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Language</label>
              <input
                type="text"
                name="language"
                value={bookForm.language}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
                required
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Published Date</label>
              <input
                type="date"
                name="publishedDate"
                value={bookForm.publishedDate}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
                required
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Description</label>
              <textarea
                name="description"
                value={bookForm.description}
                onChange={handleBookFormChange}
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Availability</label>
              <select
                name="isAvailable"
                value={bookForm.isAvailable ? "true" : "false"}
                onChange={(e) =>
                  setBookForm((prev) => ({
                    ...prev,
                    isAvailable: e.target.value === "true"
                  }))
                }
                className="w-full p-2 border rounded text-2xl"
                style={{ color: "white" }}
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div>
              <label className="block text-2xl font-semibold mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="w-full text-2xl"
                style={{ color: "white" }}
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Image Preview"
                    width={200}
                    height={300}
                    className="object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
            <Button type="submit" className="px-8 py-4 text-2xl font-semibold rounded-lg">
              Add Book
            </Button>
          </form>
        </section>

        {/* Blank Card Placeholder */}
        <div className="rounded-lg p-6" style={{ backgroundColor: "#0A0A0A" }}></div>
      </div>
    </div>
  );
}
