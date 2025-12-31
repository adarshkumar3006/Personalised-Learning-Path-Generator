const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/learning-paths', require('./routes/learningPaths'));
app.use('/api/users', require('./routes/users'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/activity', require('./routes/activity'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log(' Connected to MongoDB');

    // Create demo user if it doesn't exist
    const User = require('./models/User');
    User.findOne({ email: 'demo@example.com' }).then(user => {
      if (!user) {
        const bcrypt = require('bcryptjs');
        User.create({
          name: 'Demo User',
          email: 'demo@example.com',
          password: bcrypt.hashSync('demo123', 10)
        }).then(() => console.log(' Demo user created'));
      }
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

