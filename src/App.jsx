import React, { useState, lazy, Suspense,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Movie from './pages/Movies';
import Profile from './pages/Profile';
import SeatBooking from './pages/SeatBooking';
import MovieDetails from './pages/MovieDetails';
import UserLayout from './layouts/UserLayout';
import PaymentPage from "./components/PaymentPage";
import AdminAddShow from './pages/AdminAddShow';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtected from './components/AdminProtected';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AdminPage from './pages/AdminPage';


import './App.css'; // Assuming you have some global styles
import BookingHistory from './pages/BookingHistory';


const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Save token on login
  const handleLogin = (token,userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId); 
    setToken(token);

    
  };

  // Clear token on logout
  const handleLogout = () => {
    localStorage.removeItem('token');
   
    setToken(null);
  };
   
  useEffect(() => {
    if (token) {
      import('./pages/Profile');
      import('./pages/SeatBooking');
      import('./pages/Movies');
      import('./pages/BookingHistory');
      import('./pages/MovieDetails')
    }
  }, [token]);

   return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      
      <Routes>
        <Route path="/" element={<h1 className='home'>Welcome to Movie Booking App</h1>} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPage />} />
          
      <Route path="/admin/login" element={<AdminLogin />} />
     <Route
  path="/admin/dashboard"
  element={
    localStorage.getItem('adminToken') ? (
      <AdminDashboard />
    ) : (
      <Navigate to="/admin/login" />
    )
  }
/>
         <Route path="/add-show/:movieId" element={<AdminAddShow />} />
        <Route
          path="user"
          element={
            <ProtectedRoute token={token}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<Profile token={token} />} />
        <Route path="movies" element={<Movie />} />
        <Route path="bookings" element={<BookingHistory  token = {token}/>} />
         <Route path="movies/:id" element={<MovieDetails />} /> 
        <Route path="book/:showId" element={<SeatBooking />} />
        <Route path="payment" element={<PaymentPage />} />
        </Route>
     </Routes>
     </Router>   
         
  );
};

export default App;