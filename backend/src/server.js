const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW() AS current_time');
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: rows[0].current_time,
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

const path = require('path');
const fs = require('fs');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owner', ownerRoutes);

const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    if (req.accepts('html')) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Store Rating Platform</title></head>
          <body style="font-family:sans-serif;padding:2.5rem;text-align:center;">
            <h2>Store Rating Platform API Server</h2>
            <p>The backend API is running on port ${PORT}.</p>
            <p>Access the React UI via Vite: <a href="http://localhost:5173">http://localhost:5173</a></p>
          </body>
        </html>
      `);
    }
    res.json({
      success: true,
      message: 'Store Rating Platform API is running.',
      frontendUrl: 'http://localhost:5173',
      endpoints: {
        health: '/api/health',
        stores: '/api/stores',
        login: '/api/auth/login',
      },
    });
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Store Rating API running at http://localhost:${PORT}`);
});

module.exports = app;
