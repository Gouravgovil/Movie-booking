import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './moviedetails.css'

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/api/movies/${id}`)
      .then(res => setMovie(res.data.movie))
      .catch(err => console.error('Error fetching movie:', err));

    axios.get(`http://localhost:3000/api/shows/movie/${id}`)
      .then(res => setShows(res.data))
      .catch(err => console.error('Error fetching shows:', err));
  }, [id]);

  const handleBook = (showId) => {
    navigate(`/user/book/${showId}`);
  };

  if (!movie) return <p className="loading-text">Loading...</p>;

  // Render stars with plain CSS classes
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }
    if (halfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
  };
  return (
    <div className="moviedetails-container">
      <div className="movie-details">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="movie-poster" 
        />
        <div className="movie-info">
          <h2 className="movie-title">{movie.title}</h2>
          <div className="rating">
            <div className="stars">{renderStars(movie.rating || 0)}</div>
            <span className="rating-number">({movie.rating ? movie.rating.toFixed(1) : 'N/A'})</span>
          </div>
          <p className="movie-meta">{movie.genre} • {movie.duration} mins</p>
          <p className="movie-description">{movie.description}</p>
        </div>
      </div>

      <div className="shows-section">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Available Shows</h3>
        {shows.length === 0 ? (
          <p className="no-shows">No shows available.</p>
        ) : (
          <ul className="shows-list">
            {shows.map(show => (
              <li 
                key={show._id} 
                className="show-item"
              >
                <div>
                  <p className="screen">Screen {show.screen}</p>
                  <p className="start-time">{new Date(show.startTime).toLocaleString()}</p>
                </div>
                <button onClick={() => navigate(`/user/book/${show._id}`)} className="book-btn">Book Now</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;