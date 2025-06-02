import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.css'; // Assuming you have some styles for the login form

const Login = ({ onLogin }) => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/api/login', form);

            // Save only the token (required for protected routes)
            localStorage.setItem('user', JSON.stringify({
                token: res.data.token,
                userId: res.data.userId
            }));


            // Optional: Call onLogin to lift token to App state (if passed as prop)
            if (onLogin) onLogin(res.data.token);

            navigate('/user/profile');
        } catch (err) {
            alert(err.response?.data?.error || 'Login failed');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='login-form'>
            <h2>Login</h2>
            <input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
            />
            <input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default Login;
