import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [originalUrl, setOriginalUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [expiryDays, setExpiryDays] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        try {
            const res = await axios.get('http://localhost:3000/my-urls', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUrls(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!originalUrl) {
            setError('URL is required');
            return;
        }

        setCreating(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('http://localhost:3000/shorten', {
                originalUrl,
                customCode: customCode || undefined,
                expiryDays: expiryDays || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('URL created successfully!');
            setOriginalUrl('');
            setCustomCode('');
            setExpiryDays('');
            setTimeout(fetchUrls, 1500);

        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (shortCode) => {
        try {
            await axios.delete(`http://localhost:3000/url/${shortCode}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUrls(urls.filter(u => u.shortCode !== shortCode));
        } catch (err) {
            console.log(err);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <div className="dashboard">
            <nav className="nav">
                <div className="nav-logo">⚡ ShortURL</div>
                <div className="nav-links">
                    <button onClick={() => navigate('/')} className="btn-ghost">Home</button>
                    <button onClick={handleLogout} className="btn-outline">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="create-box">
                    <h2 className="section-title">Create Short URL</h2>
                    <div className="create-form">
                        <input
                            type="text"
                            placeholder="Paste your long URL here..."
                            value={originalUrl}
                            onChange={(e) => setOriginalUrl(e.target.value)}
                            className="form-input"
                        />
                        <div className="create-row">
                            <input
                                type="text"
                                placeholder="Custom code (optional)"
                                value={customCode}
                                onChange={(e) => setCustomCode(e.target.value)}
                                className="form-input"
                            />
                            <input
                                type="number"
                                placeholder="Expiry days (optional)"
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(e.target.value)}
                                className="form-input"
                            />
                            <button
                                onClick={handleCreate}
                                className="btn-primary"
                                disabled={creating}
                            >
                                {creating ? 'Creating...' : 'Create ⚡'}
                            </button>
                        </div>
                        {error && <p className="error-msg">{error}</p>}
                        {success && <p className="success-msg">{success}</p>}
                    </div>
                </div>

                <div className="urls-section">
                    <h2 className="section-title">Your URLs</h2>
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : urls.length === 0 ? (
                        <div className="empty-state">
                            <p>No URLs yet!</p>
                            <span>Create your first short URL above</span>
                        </div>
                    ) : (
                        <div className="urls-list">
                            {urls.map((url) => (
                                <div key={url._id} className="url-card">
                                    <div className="url-card-left">
                                        <div className="url-short">
                                            <a
                                                href={`http://localhost:3000/${url.shortCode}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                localhost:3000/{url.shortCode}
                                            </a>
                                            <button
                                                onClick={() => copyToClipboard(`http://localhost:3000/${url.shortCode}`)}
                                                className="btn-copy"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <div className="url-original">{url.originalUrl}</div>
                                        <div className="url-meta">
                                            <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                                            {url.expiresAt && (
                                                <span>Expires: {new Date(url.expiresAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="url-card-right">
                                        <div className="url-clicks">
                                            <span className="clicks-number">{url.clicks}</span>
                                            <span className="clicks-label">clicks</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(url.shortCode)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;