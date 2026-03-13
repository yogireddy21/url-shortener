# ⚡ Scalable URL Shortener

A **production-ready URL shortening service** similar to Bitly, built with **Node.js, Express, React, MongoDB, and Redis**.
It supports authentication, analytics, custom short URLs, rate limiting, and a dashboard to manage links.

## 🚀 Live Demo

Frontend: https://urlshortneryogi.up.railway.app/
Backend API: url-shortener-production-58b4.up.railway.app

---

# 📌 Features

### 🔗 URL Shortening

* Convert long URLs into short, shareable links
* Custom short codes support
* Optional expiry for links

### 📊 Analytics

* Track number of clicks
* View created URLs in dashboard
* Expiry tracking

### 🔐 Authentication

* User signup and login
* JWT-based authentication
* Secure API endpoints

### ⚡ Performance Optimizations

* Redis caching for fast redirects
* Rate limiting to prevent abuse
* Queue-based analytics processing

### 🖥 Dashboard

* Create short URLs
* View analytics
* Delete URLs
* Copy links easily

---

# 🏗 Architecture

```
User
 ↓
React Dashboard
 ↓
Node.js API (Express)
 ↓
Redis Cache
 ↓
MongoDB Database
```

---

# 🛠 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Redis
* JWT Authentication
* Rate Limiting

### Frontend

* React
* Axios
* React Router

### DevOps

* Docker
* Railway Deployment

---

# 📂 Project Structure

```
url-shortener
│
├── client/                 # React frontend
│   ├── src/
│   └── package.json
│
├── src/                    # Backend API
│   ├── index.js
│   ├── routes.js
│   ├── db.js
│   ├── redis.js
│   ├── rateLimiter.js
│   └── queue.js
│
├── Dockerfile
├── package.json
└── README.md
```

---

# ⚙️ Installation

Clone the repository:

```
git clone https://github.com/yogireddy21/url-shortener.git
cd url-shortener
```

Install backend dependencies:

```
npm install
```

Install frontend dependencies:

```
cd client
npm install
```

---

# ▶️ Running Locally

Start backend:

```
npm run start
```

Start frontend:

```
cd client
npm start
```

---

# 🌍 Environment Variables

Create `.env` in root:

```
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
REDIS_URL=your_redis_url
```

Frontend `.env`:

```
REACT_APP_API=http://localhost:3000
```

---

# 📡 API Endpoints

### Authentication

```
POST /auth/signup
POST /auth/login
```

### URL Shortening

```
POST /shorten
GET /:shortCode
GET /my-urls
DELETE /url/:shortCode
```

### Analytics

```
GET /analytics/:shortCode
```

---

# 📈 Future Improvements

* Distributed ID generator (Base62)
* Click analytics dashboard
* Geo-location tracking
* Kafka-based analytics pipeline
* Custom domains

---

# 👨‍💻 Author

**Yogeswar Reddy**

LinkedIn: https://www.linkedin.com/in/yogeswar-reddy-rachamallu-97550826b/

---

# ⭐ If you like this project

Give it a **star on GitHub** ⭐
