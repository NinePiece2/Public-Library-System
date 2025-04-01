"use client";

import { useState, useEffect, ChangeEvent, FormEvent, KeyboardEvent, useRef } from "react";
import Image from "next/image";
import Button from "@/components/Button";

interface User {
  id: string;
  email: string;
  roles: string; // Comma-separated list of roles, e.g. "admin,user"
}

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
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

// PendingReservation interface from API
interface PendingReservation {
  reservation: {
    id: number;
    userId: string;
    bookId: number;
    reservationDate: string;
    expirationDate: string;
    isExpired: boolean;
    dueDate: string;
    isClaimed: boolean;
  };
  user: {
    id: string;
    email: string;
    username: string;
  };
  book: Book;
}

// For pending returns we assume a similar interface.
type PendingReturn = PendingReservation;

export default function AdminPage() {
  // USER MANAGEMENT STATE
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState(""); // expecting "user" or "admin"
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // PENDING RESERVATIONS STATE
  const [pendingReservations, setPendingReservations] = useState<PendingReservation[]>([]);
  // PENDING RETURNS STATE
  const [pendingReturns, setPendingReturns] = useState<PendingReturn[]>([]);

  // Modal state for expand views
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [reservationsModalSearch, setReservationsModalSearch] = useState("");
  const [showReturnsModal, setShowReturnsModal] = useState(false);
  const [returnsModalSearch, setReturnsModalSearch] = useState("");

  // ADD BOOK FORM STATE
  const [bookForm, setBookForm] = useState({
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
      const res = await fetch(
        `/api/proxy/api/admin/GetUsersEmails?email=${encodeURIComponent(userSearch)}`
      );
      const users: User[] = await res.json();
      // For each user, fetch their roles
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          try {
            const resRoles = await fetch(
              `/api/proxy/api/admin/GetUser?userId=${encodeURIComponent(user.id)}`
            );
            if (resRoles.ok) {
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
    setNewRole(user.roles.toLowerCase().includes("admin") ? "admin" : "user");
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const updateData = {
        userId: selectedUser.id,
        role: newRole,
      };
      const res = await fetch(`/api/proxy/api/admin/UpdateUserRole`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        alert("User role updated successfully!");
        await handleUserSearch();
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUserSearch();
    }
  };

  // -------------------- Reservations Management --------------------
  const fetchPendingReservations = async () => {
    try {
      const res = await fetch(`/api/proxy/api/reservation/GetPendingReservations`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Unexpected response: " + text);
      }
      const data = await res.json();
      setPendingReservations(data);
    } catch (error) {
      console.error("Error fetching pending reservations", error);
    }
  };

  const fetchPendingReturns = async () => {
    try {
      // Assuming a similar API exists for pending returns.
      const res = await fetch(`/api/proxy/api/reservation/GetPendingReturns`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Unexpected response: " + text);
      }
      const data = await res.json();
      setPendingReturns(data);
    } catch (error) {
      console.error("Error fetching pending returns", error);
    }
  };

  useEffect(() => {
    fetchPendingReservations();
    fetchPendingReturns();
  }, []);

  const handleClaimReservation = async (reservationId: number) => {
    try {
      const res = await fetch(
        `/api/proxy/api/reservation/ClaimReservation/${reservationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.ok) {
        alert("Reservation marked as claimed!");
        await fetchPendingReservations();
      } else {
        alert("Failed to mark reservation as claimed");
      }
    } catch (error) {
      console.error("Error claiming reservation", error);
    }
  };

  // New function to mark a reservation as returned
  const handleReturnReservation = async (reservationId: number) => {
    try {
      const res = await fetch(
        `/api/proxy/api/reservation/ReturnReservation/${reservationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.ok) {
        alert("Reservation marked as returned!");
        await fetchPendingReturns();
      } else {
        alert("Failed to mark reservation as returned");
      }
    } catch (error) {
      console.error("Error marking reservation as returned", error);
    }
  };

  // -------------------- Modal Filtering --------------------
  const filteredReservations = pendingReservations.filter((item) =>
    item.user.email.toLowerCase().includes(reservationsModalSearch.toLowerCase()) ||
    item.user.username.toLowerCase().includes(reservationsModalSearch.toLowerCase()) ||
    item.book.title.toLowerCase().includes(reservationsModalSearch.toLowerCase())
  );
  const filteredReturns = pendingReturns.filter((item) =>
    item.user.email.toLowerCase().includes(returnsModalSearch.toLowerCase()) ||
    item.user.username.toLowerCase().includes(returnsModalSearch.toLowerCase()) ||
    item.book.title.toLowerCase().includes(returnsModalSearch.toLowerCase())
  );

  // -------------------- Add Book Section --------------------
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookForm((prev) => ({ ...prev, [name]: value }));
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
            setImageFile(null);
            setImagePreview("");
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

  // -------------------- Render --------------------
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

        {/* Pending Reservations Section */}
        <section className="rounded-lg p-6" style={{ backgroundColor: "#121212" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              Pending Reservations
            </h2>
            <Button
              className="px-4 py-2 text-2xl font-semibold rounded-lg"
              onClick={() => setShowReservationsModal(true)}
            >
              Expand
            </Button>
          </div>
          {pendingReservations.length === 0 ? (
            <p className="text-2xl">No pending reservations found.</p>
          ) : (
            <ul className="space-y-4">
              {pendingReservations.slice(0, 3).map((item) => (
                <li
                  key={item.reservation.id}
                  className="p-4 border rounded flex flex-col gap-2"
                  style={{ color: "white" }}
                >
                  <div className="text-xl">
                    <strong>User:</strong> {item.user.email} ({item.user.username})
                  </div>
                  <div className="text-xl">
                    <strong>Book:</strong> {item.book.title} by {item.book.author}
                  </div>
                  <div className="text-xl">
                    <strong>Reserved:</strong>{" "}
                    {new Date(item.reservation.reservationDate).toLocaleDateString()}
                  </div>
                  <div className="text-xl">
                    <strong>Expires:</strong>{" "}
                    {new Date(item.reservation.expirationDate).toLocaleDateString()}
                  </div>
                  <div className="text-xl">
                    <strong>Claimed:</strong>{" "}
                    {item.reservation.isClaimed ? "Yes" : "No"}
                  </div>
                  {!item.reservation.isClaimed && (
                    <Button
                      className="mt-2 px-4 py-2 text-2xl font-semibold rounded-lg"
                      onClick={() => {
                        handleClaimReservation(item.reservation.id);
                        setShowReservationsModal(false);
                      }}
                    >
                      Mark as Claimed
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pending Returns Section */}
        <section className="rounded-lg p-6" style={{ backgroundColor: "#121212" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              Pending Returns
            </h2>
            <Button
              className="px-4 py-2 text-2xl font-semibold rounded-lg"
              onClick={() => setShowReturnsModal(true)}
            >
              Expand
            </Button>
          </div>
          {pendingReturns.length === 0 ? (
            <p className="text-2xl">No pending returns found.</p>
          ) : (
            <ul className="space-y-4">
              {pendingReturns.slice(0, 3).map((item) => (
                <li
                  key={item.reservation.id}
                  className="p-4 border rounded flex flex-col gap-2"
                  style={{ color: "white" }}
                >
                  <div className="text-xl">
                    <strong>User:</strong> {item.user.email} ({item.user.username})
                  </div>
                  <div className="text-xl">
                    <strong>Book:</strong> {item.book.title} by {item.book.author}
                  </div>
                  <div className="text-xl">
                    <strong>Reserved:</strong>{" "}
                    {new Date(item.reservation.reservationDate).toLocaleDateString()}
                  </div>
                  <div className="text-xl">
                    <strong>Expires (Due Date):</strong>{" "}
                    {new Date(item.reservation.dueDate).toLocaleDateString()}
                  </div>
                  <div className="text-xl">
                    <strong>Claimed:</strong>{" "}
                    {item.reservation.isClaimed ? "Yes" : "No"}
                  </div>
                  <Button
                    className="mt-2 px-4 py-2 text-2xl font-semibold rounded-lg"
                    onClick={() => {
                      handleReturnReservation(item.reservation.id);
                      setShowReturnsModal(false);
                    }}
                  >
                    Book Returned
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
      </div>

      {/* Modal for Pending Reservations Expand */}
      {showReservationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="p-6 rounded-lg max-w-lg w-full" style={{ backgroundColor: "#121212" }}>
            <h2 className="text-3xl font-semibold mb-4">Search Pending Reservations</h2>
            <input
              type="text"
              value={reservationsModalSearch}
              onChange={(e) => setReservationsModalSearch(e.target.value)}
              placeholder="Search by book, username or email"
              className="w-full p-2 border rounded text-2xl mb-4 text-white"
              style={{ color: "white" }}
            />
            <ul className="space-y-4 max-h-80 overflow-y-auto">
              {filteredReservations.map((item) => (
                <li
                  key={item.reservation.id}
                  className="p-4 border rounded flex flex-col gap-2 text-white"
                >
                  <div>
                    <strong>User:</strong> {item.user.email} ({item.user.username})
                  </div>
                  <div>
                    <strong>Book:</strong> {item.book.title} by {item.book.author}
                  </div>
                  <div>
                    <strong>Reserved:</strong>{" "}
                    {new Date(item.reservation.reservationDate).toLocaleDateString()}
                  </div>
                  <Button
                    className="mt-2 px-4 py-2 text-2xl font-semibold rounded-lg"
                    onClick={() => {
                      handleClaimReservation(item.reservation.id);
                      setShowReservationsModal(false);
                    }}
                  >
                    Mark as Claimed
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              className="mt-4 px-4 py-2 text-2xl font-semibold rounded-lg"
              onClick={() => setShowReservationsModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Modal for Pending Returns Expand */}
      {showReturnsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="p-6 rounded-lg max-w-lg w-full" style={{ backgroundColor: "#121212" }}>
            <h2 className="text-3xl font-semibold mb-4">Search Pending Returns</h2>
            <input
              type="text"
              value={returnsModalSearch}
              onChange={(e) => setReturnsModalSearch(e.target.value)}
              placeholder="Search by book, username or email"
              className="w-full p-2 border rounded text-2xl mb-4"
              style={{ color: "white" }}
            />
            <ul className="space-y-4 max-h-80 overflow-y-auto">
              {filteredReturns.map((item) => (
                <li
                  key={item.reservation.id}
                  className="p-4 border rounded flex flex-col gap-2 text-white"
                >
                  <div>
                    <strong>User:</strong> {item.user.email} ({item.user.username})
                  </div>
                  <div>
                    <strong>Book:</strong> {item.book.title} by {item.book.author}
                  </div>
                  <div>
                    <strong>Reserved:</strong>{" "}
                    {new Date(item.reservation.reservationDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Expires:</strong>{" "}
                    {new Date(item.reservation.expirationDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Claimed:</strong>{" "}
                    {item.reservation.isClaimed ? "Yes" : "No"}
                  </div>
                  <Button
                    className="mt-2 px-4 py-2 text-2xl font-semibold rounded-lg"
                    onClick={() => {
                      handleReturnReservation(item.reservation.id);
                      setShowReturnsModal(false);
                    }}
                  >
                    Book Returned
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              className="mt-4 px-4 py-2 text-2xl font-semibold rounded-lg"
              onClick={() => setShowReturnsModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
