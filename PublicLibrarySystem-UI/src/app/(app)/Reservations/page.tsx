"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import Button from "@/components/Button";

interface UserDetails {
  id: string;
  email: string;
  username: string;
}

interface ReservationData {
  id: number;
  userId: string;
  bookId: number;
  reservationDate: string;
  expirationDate: string;
  isExpired: boolean;
  dueDate: string | null;
  isClaimed: boolean;
  isReturned: boolean;
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

interface ReservationWithDetails {
  reservation: ReservationData;
  user: UserDetails;
  book: Book;
}

export default function ReservationPage() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  // Get userID from cookie
  const userId = Cookies.get("userID");

  useEffect(() => {
    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }
    const fetchReservations = async () => {
      try {
        const res = await fetch(`/api/proxy/api/reservation/GetUserReservations?userId=${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch reservations.");
        }
        const data: ReservationWithDetails[] = await res.json();
        // Sort reservations by descending reservationDate
        data.sort(
          (a, b) =>
            new Date(b.reservation.reservationDate).getTime() -
            new Date(a.reservation.reservationDate).getTime()
        );
        setReservations(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching reservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [userId]);

  // Filter reservations based on the selected period
  const filteredReservations = reservations.filter(({ reservation }) => {
    if (filterPeriod === "all") return true;
    const resDate = new Date(reservation.reservationDate);
    const now = new Date();
     const threshold = new Date();
    if (filterPeriod === "7") {
      threshold.setDate(now.getDate() - 7);
    } else if (filterPeriod === "14") {
      threshold.setDate(now.getDate() - 14);
    } else if (filterPeriod === "30") {
      threshold.setDate(now.getDate() - 30);
    }
    return resDate >= threshold;
  });

  // Helper to determine status based on reservation fields.
  const getStatus = (r: ReservationData): string => {
    if (r.isReturned) return "Returned";
    if (!r.isClaimed) return "Pending";
    if (r.dueDate) {
      const due = new Date(r.dueDate);
      return due < new Date() ? "Overdue" : "Active";
    }
    return "Active";
  };

  // Extend rental handler
  const handleExtendRental = async (reservationId: number) => {
    setUpdatingId(reservationId);
    try {
      const res = await fetch(`/api/proxy/api/reservation/ExtendReservation/${reservationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        alert("Rental extended successfully!");
        // Refresh reservations
        const res2 = await fetch(`/api/proxy/api/reservation/GetUserReservations?userId=${userId}`);
        const data: ReservationWithDetails[] = await res2.json();
        data.sort(
          (a, b) =>
            new Date(b.reservation.reservationDate).getTime() -
            new Date(a.reservation.reservationDate).getTime()
        );
        setReservations(data);
      } else {
        alert("Failed to extend rental.");
      }
    } catch (error) {
      console.error("Error extending rental", error);
      alert("Error extending rental.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl">Loading reservations...</p>
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

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col items-center">
      <h1 className="text-5xl font-bold mb-4" style={{ fontSize: "2rem", padding: "0.5rem" }}>
        My Reservations
      </h1>
      {/* Filter Dropdown Row */}
      <div className="w-full flex justify-end mb-8">
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="p-2 border rounded text-2xl"
          style={{ fontSize: "1rem", padding: "0.5rem", color: "white", backgroundColor: "#121212" }}
        >
          <option value="7">Last 7 Days</option>
          <option value="14">Last 14 Days</option>
          <option value="30">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>
      {filteredReservations.length === 0 ? (
        <p className="text-2xl">No reservations found.</p>
      ) : (
        <ul className="space-y-6 w-full">
          {filteredReservations.map(({ reservation, book }) => (
            <li key={reservation.id} className="p-4 border rounded flex flex-col gap-4">
              <div className="flex flex-row items-center justify-center gap-8">
                {/* Large Image on the left */}
                {book.imageBase64 && book.imageMimeType ? (
                  <div className="relative w-48 h-64">
                    <Image
                      src={`data:${book.imageMimeType};base64,${book.imageBase64}`}
                      alt={book.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-64 bg-gray-500 flex items-center justify-center rounded">
                    <span className="text-white">No Image</span>
                  </div>
                )}
                {/* Centered text with details including dates */}
                <div className="flex-1 text-center">
                  <h2 className="text-3xl font-semibold text-white">{book.title}</h2>
                  <p className="text-xl text-white">by {book.author}</p>
                  <p className="text-xl text-white">
                    Status: <span className="font-semibold">{getStatus(reservation)}</span>
                  </p>
                  <p className="text-xl text-white">
                    <strong>Reservation Date:</strong>{" "}
                    {new Date(reservation.reservationDate).toLocaleDateString()}
                  </p>
                  <p className="text-xl text-white">
                    <strong>Expiration Date:</strong>{" "}
                    {new Date(reservation.expirationDate).toLocaleDateString()}
                  </p>
                  {reservation.dueDate && (
                    <p className="text-xl text-white">
                      <strong>Due Date:</strong>{" "}
                      {new Date(reservation.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {getStatus(reservation) === "Active" && (
                <div className="flex justify-center">
                  <Button
                    className="px-6 py-3 text-2xl font-semibold rounded-lg"
                    onClick={() => handleExtendRental(reservation.id)}
                    disabled={updatingId === reservation.id}
                  >
                    {updatingId === reservation.id ? "Extending..." : "Extend Rental"}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
