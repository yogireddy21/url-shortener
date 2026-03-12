import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Email and password required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/signup';
            const res = await axios.post(`http://localhost:3000${endpoint}`, {
                email,
                password
            });

            localStorage.setItem('token', res.data.token);
            navigate('/');

        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">⚡ ShortURL</div>
                <h2 className="auth-title">
                    {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="auth-subtitle">
                    {isLogin ? 'Sign in to manage your links' : 'Start shortening URLs for free'}
                </p>

                {/* tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(true); setError(''); }}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(false); setError(''); }}
                    >
                        Signup
                    </button>
                </div>

                {/* form */}
                <div className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="form-input"
                        />
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        className="btn-primary auth-btn"
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : isLogin ? 'Login →' : 'Create Account →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Auth;