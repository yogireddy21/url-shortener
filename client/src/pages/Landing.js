import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

function Landing() {
    const [url, setUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [expiryDays, setExpiryDays] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const API = "https://url-shortener-production-58b4.up.railway.app";

    const handleShorten = async () => {
        if (!token) {
            navigate('/auth');
            return;
        }

        if (!url) {
            setError('Please enter a URL');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${API}/shorten`, {
                originalUrl: url,
                customCode: customCode || undefined,
                expiryDays: expiryDays || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setResult(res.data);
            setUrl('');
            setCustomCode('');
            setExpiryDays('');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="landing">
            {/* navbar */}
            <nav className="nav">
                <div className="nav-logo">⚡ ShortURL</div>
                <div className="nav-links">
                    {token ? (
                        <>
                            <button onClick={() => navigate('/dashboard')} className="btn-ghost">Dashboard</button>
                            <button onClick={() => { localStorage.removeItem('token'); navigate('/auth'); }} className="btn-outline">Logout</button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/auth')} className="btn-primary">Get Started</button>
                    )}
                </div>
            </nav>

            {/* hero */}
            <div className="hero">
                <div className="hero-badge">⚡ Fast • Reliable • Smart</div>
                <h1 className="hero-title">
                    Shorten URLs<br />
                    <span className="gradient-text">Supercharge Links</span>
                </h1>
                <p className="hero-subtitle">
                    Transform long URLs into powerful short links with analytics, expiry, and more.
                </p>

                {/* shorten form */}
                <div className="shorten-box">
                    <div className="shorten-input-row">
                        <input
                            type="text"
                            placeholder="Paste your long URL here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                            className="shorten-input"
                        />
                        <button
                            onClick={handleShorten}
                            className="btn-primary shorten-btn"
                            disabled={loading}
                        >
                            {loading ? 'Shortening...' : 'Shorten ⚡'}
                        </button>
                    </div>
                    <div className="shorten-options-row">
                        <input
                            type="text"
                            placeholder="Custom code (optional)"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                            className="shorten-input"
                        />
                        <input
                            type="number"
                            placeholder="Expiry days (optional)"
                            value={expiryDays}
                            onChange={(e) => setExpiryDays(e.target.value)}
                            className="shorten-input"
                        />
                    </div>

                    {error && <p className="error-msg">{error}</p>}

                    {result && (
                        <div className="result-box">
                            <div className="result-url">
                                <span>{result.shortUrl}</span>
                                <button
                                    onClick={() => copyToClipboard(result.shortUrl)}
                                    className="btn-copy"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* stats */}
                <div className="stats">
                    <div className="stat">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Links Shortened</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">99.9%</span>
                        <span className="stat-label">Uptime</span>
                    </div>
                    <div className="stat">
                        <span className="stat-number">5ms</span>
                        <span className="stat-label">Avg Response</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;