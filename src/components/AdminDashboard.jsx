import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieForm from './MovieForm';
import AdminAddShow from '../pages/AdminAddShow';
import './style.css';
import './Admin.css'
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addingShowForMovieId, setAddingShowForMovieId] = useState(null);
  const [revenue, setRevenue] = useState(0);
  const navigate = useNavigate();




  const fetchRevenue = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/total-revenue');
      setRevenue(response.data.revenue);
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
    }
  };

  fetchRevenue();


  const fetchMovies = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/movies');
      console.log('Bookings:', res.data)
      setMovies(res.data.movies);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    }
  };
  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/admin/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };
  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/cancel-booking/${id}`

      );

      alert("Booking cancelled and refunded");
      fetchBookings();
      fetchRevenue();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
    }
  };
  useEffect(() => {
    fetchMovies();
    fetchBookings();
    fetchRevenue();
  }, []);

  const handleCancel = () => {
    setEditingMovieId(null);
    setIsAdding(false);
    setAddingShowForMovieId(null);
  };

  return (
    <div className='admin-dashboard'>
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="revenue-section">
        <h2>Total Revenue</h2>
        <p>₹{Number(revenue).toLocaleString()}</p>
      </div>

      {(editingMovieId || isAdding) ? (
        <div>
          <button onClick={handleCancel}>Cancel</button>
          <MovieForm
            movieId={editingMovieId}
            onSuccess={() => {
              fetchMovies();
              handleCancel();
            }}
            onDelete={() => {
              fetchMovies();
              handleCancel();
            }}
          />
        </div>
      ) : addingShowForMovieId === 'select' ? (
        <div>
          <button onClick={handleCancel}>Cancel</button>
          <AdminAddShow
            movieId={addingShowForMovieId}
            onShowAdded={() => {
              fetchMovies();
              handleCancel();
            }}
          />
        </div>
      ) : (
        <>
          <button style={{ marginRight: '475px' }} onClick={() => setIsAdding(true)}>Add New Movie</button>
          <button onClick={() => setAddingShowForMovieId('select')}>Add Show</button>

          <ul>
            {movies.map(movie => (
              <li key={movie._id}>
                {movie.title}{' '}
                <button onClick={() => setEditingMovieId(movie._id)}>Edit</button>

              </li>
            ))}
          </ul>
        </>
      )}
      <hr />
      <div className="bookings-container">
        <h2>All Bookings</h2>
        {bookings.length === 0 ? (
          <p className="empty-message">No bookings found.</p>
        ) : (
          <ul className="booking-list">
            {bookings.map(b => (
              <li key={b._id} className="booking-card">
                <div className="booking-info">
                  <strong>User:</strong> {b.user?.name || 'Guest'} <br />
                  <strong>Movie:</strong> {b.show?.movie?.title} <br />
                  <strong>Showtime:</strong> {new Date(b.show?.startTime).toLocaleString()} <br />
                  {/* <strong>Seats:</strong> {b.seats.join(', ')} <br /> */}
                  <strong>Amount Paid:</strong> ₹{b.amountPaid} <br />
                  <button onClick={() => handleCancelBooking(b._id)}>Cancel & Refund</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
