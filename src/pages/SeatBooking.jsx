// pages/SeatBooking.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./SeatBooking.css";

const SeatBooking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [blockedSeats, setBlockedSeats] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  const reconnectTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/shows/${showId}`)    
      .then(res => setShow(res.data))
      .catch(err => console.error('Error fetching show:', err));
  }, [showId]);

  const setupWebSocket = () => {
    const ws = new WebSocket(`ws://${window.location.hostname}:3000`);

    setConnectionStatus('connecting');

    ws.onopen = () => {
      console.log('WebSocket connected');
      socketRef.current = ws;
      setConnectionStatus('connected');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.showId !== showId) return;

        if (msg.type === 'SEAT_BLOCKED') {
          setBlockedSeats(prev => [...new Set([...prev, msg.seatId])]);
        } else if (msg.type === 'SEAT_UNBLOCKED') {
          setBlockedSeats(prev => prev.filter(id => id !== msg.seatId));
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setConnectionStatus('error');
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed', event.code, event.reason);
      setConnectionStatus('disconnected');
      socketRef.current = null;

      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Reconnecting WebSocket...');
          setupWebSocket();
        }, 3000);
      }
    };
  };

  useEffect(() => {
    setupWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close(1000, 'Component unmounting');
    };
  }, [showId]);

  const handleSeatClick = (seatId) => {
    const seat = show.seats.find(s => s._id === seatId);
    if (seat.isBooked || blockedSeats.includes(seatId)) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert('WebSocket not connected. Please wait...');
      return;
    }

    const isSelected = selectedSeats.includes(seatId);
    const updatedSeats = isSelected
      ? selectedSeats.filter(id => id !== seatId)
      : [...selectedSeats, seatId];

    setSelectedSeats(updatedSeats);

    socketRef.current.send(JSON.stringify({
      type: isSelected ? 'UNBLOCK_SEAT' : 'BLOCK_SEAT',
      showId,
      seatId
    }));
  };

  const handleBooking = () => {
    if (!show) return;

    const seatNumbers = selectedSeats.map(seatId => {
      const seat = show.seats.find(s => s._id === seatId);
      return seat ? seat.number : seatId; // fallback if number not found
    });

    navigate('/user/payment', {
      state: {
        showId,
        selectedSeats,
        pricePerSeat: show.price,
        movieTitle: show.movie.title,
        screen: show.screen,
        startTime: show.startTime,
        seatNumbers,
      },
    });
  };

  if (!show) return <p className="p-4">Loading...</p>;

  return (
    <div className="seat-booking-container">
      <div className="show-details">
        <h2 className="movie-title">{show.movie.title}</h2>
        <p className="show-info">Theater: <span>{show.screen}</span></p>
        <p className="show-info">Showtime: <span>{new Date(show.startTime).toLocaleString()}</span></p>
        <p className="show-info">Price per seat: ₹<span>{show.price}</span></p>
      </div>

      <div className="seat-selection">
        <h3 className="section-title">Select Your Seats</h3>
        <div className="seat-grid">
          {show.seats.map(seat => {
            const isSelected = selectedSeats.includes(seat._id);
            const isBooked = seat.isBooked;
            const isBlocked = blockedSeats.includes(seat._id);
            const isClickable = !isBooked && !isBlocked && connectionStatus === 'connected';

            return (
              <div
                key={seat._id}
                className={`w-10 h-10 flex items-center justify-center border rounded text-sm font-medium
                  ${isBooked ? 'bg-red-400 cursor-not-allowed' :
                  isBlocked ? 'bg-yellow-300 cursor-not-allowed' :
                  isSelected ? 'bg-green-400' :
                  'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => isClickable && handleSeatClick(seat._id)}
                title={isBooked ? 'Already booked' : isBlocked ? 'Blocked by another user' : 'Click to select'}
              >
                {seat.number}
              </div>
            );
          })}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="booking-summary">
          <h3 className="section-title">Booking Summary</h3>
          <p>Seats selected: {
            selectedSeats.map(seatId => {
              const seat = show.seats.find(s => s._id === seatId);
              return seat ? seat.number : 'Unknown';
            }).join(', ')
          }</p>
          <p>Total Price: ₹{selectedSeats.length * show.price}</p>
        </div>
      )}

      <button
        onClick={handleBooking}
        className="confirm-btn"
        disabled={selectedSeats.length === 0 || connectionStatus !== 'connected'}
      >
        Confirm Booking
      </button>
    </div>
  );
};

export default SeatBooking;
