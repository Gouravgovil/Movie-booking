import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/bookings/user/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(res.data.bookings || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Download PDF ticket function
  const downloadTicket = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/ticket/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to download ticket');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Error downloading ticket');
    }
  };

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!bookings || bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div>
  <h2>Your Booking History</h2>
  {bookings.length === 0 ? (
    <p>You have no bookings yet.</p>
  ) : (
    <ul>
      {bookings.map((booking) => (
        <li
          key={booking._id}
          style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}
        >
          <strong>Movie:</strong> {booking.show.movie.title} <br />
          <strong>Screen:</strong> {booking.show.screen} <br />
          <strong>Showtime:</strong>{' '}
          {new Date(booking.show.startTime).toLocaleString()} <br />
          <strong>Seats:</strong>{' '}
          {booking.seatNumbers.join(', ')} <br />
          <strong>Booked At:</strong>{' '}
          {new Date(booking.bookedAt).toLocaleString()} <br />
          <button
            onClick={() => downloadTicket(booking._id)}
            style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Download Ticket (PDF)
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

  );
};

export default BookingHistory;
