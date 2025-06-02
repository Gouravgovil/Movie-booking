import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MovieForm({ movieId, onSuccess,onDelete }) {
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movieId) {
      setLoading(true);
      axios.get(`http://localhost:3000/api/movies/${movieId}`)
        .then(res => {
          const movie = res.data.movie; //  assuming backend returns { movie: {...} }
          setTitle(movie.title || '');
          setPoster(movie.poster || '');
          setDescription(movie.description || '');
          setGenre(movie.genre || '');
          setDuration(movie.duration || '');
          setRating(movie.rating || '');
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load movie:', err);
          setLoading(false);
        });
    }
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      poster,
      description,
      genre,
      duration: Number(duration),
      rating: Number(rating),
    };

    try {
      if (movieId) {
        await axios.put(`http://localhost:3000/api/movies/${movieId}`, payload);
        alert('Movie updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/movies', payload);
        alert('Movie created successfully');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("Are you sure you want to delete this movie?")) return;

    try{
      await axios.delete(`http://localhost:3000/api/movies/${movieId}`);
      alert('Movie deleted successfully');
      if(onDelete) onDelete();
      } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Failed to delete movie');
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className='movie-form'>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <input value={poster} onChange={e => setPoster(e.target.value)} placeholder="Poster URL" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" required />
      <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Genre" required />
      <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (in minutes)" type="number" required />
      <input value={rating} onChange={e => setRating(e.target.value)} placeholder="Rating (0-10)" type="number" step="0.1" min="0" max="10" />
      <button type="submit">{movieId ? 'Update Movie' : 'Add Movie'}</button>
       {movieId && (
        <button
          type="button"
          onClick={handleDelete}
          style={{ marginTop: '10px', backgroundColor: 'red', color: 'white' }}
        >
          Delete Movie
        </button>
      )}
    </form>
  );
}

export default MovieForm;
