import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const addShow = (showData) => API.post('/shows', showData);
export const fetchMovies = () => API.get('/movies'); // assuming a movies API exists
