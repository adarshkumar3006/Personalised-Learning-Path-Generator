# Personalized Learning Path Generator

A comprehensive MERN stack application that generates custom learning paths for users based on skill assessments and AI-powered recommendations. This platform helps learners identify skill gaps through interactive assessments and receives personalized roadmaps leveraging Google Gemini Flash API for intelligent suggestions.

## Overview

Personalized Learning Path Generator is an advanced learning management system that:

- Conducts skill assessments to evaluate user knowledge across multiple domains
- Generates personalized learning paths using AI-powered recommendations
- Provides curated video resources and documentation for learning
- Tracks learning progress with visual roadmap representations
- Maintains learner engagement through time tracking and competitive leaderboards
- Exports personalized learning roadmaps as PDF documents
- Manages user profiles with comprehensive assessment history and reviews

## Key Features

- **Interactive Skill Assessments**: Comprehensive quiz modules for subjects like JavaScript, Databases, and more
- **AI-Assisted Path Generation**: Google Gemini Flash API integration for intelligent learning recommendations
- **Dynamic Roadmap Visualization**: Interactive D3.js visualizations of personalized learning paths
- **Real-time Progress Tracking**: Monitor topic completion and learning milestones
- **PDF Export Capability**: Download personalized learning roadmaps for offline reference
- **User Profiles & History**: Complete assessment history and performance analytics
- **Video Learning**: Integrated YouTube video player with progress tracking
- **Time Tracking**: Monitor learning time with weekly analytics
- **Leaderboard System**: Weekly competitive leaderboard to boost learner engagement

## Tech Stack

### Frontend

- **React.js** (v18.2.0) - Modern UI library for building interactive user interfaces
- **React Router DOM** (v6.20.0) - Client-side routing for multi-page application navigation
- **Axios** (v1.6.2) - Promise-based HTTP client for API communication
- **D3.js** (v7.8.5) - Powerful data visualization library for interactive learning path roadmaps
- **React Icons** (v5.5.0) - Comprehensive icon library for UI elements
- **jsPDF** (v3.0.4) - PDF generation for exporting learning roadmaps
- **html2canvas** (v1.4.1) - HTML to canvas conversion for PDF rendering
- **React Toastify** (v9.1.3) - Toast notifications for user feedback
- **Bootstrap** (v5.3.8) - CSS framework for responsive design

### Backend

- **Node.js** - JavaScript runtime for server-side development
- **Express.js** (v4.18.2) - Lightweight web framework for building REST APIs
- **Express Validator** (v7.0.1) - Input validation and sanitization middleware
- **Mongoose** (v7.6.3) - MongoDB object modeling for Node.js
- **jsonwebtoken** (v9.0.2) - JWT implementation for secure authentication
- **bcryptjs** (v2.4.3) - Password hashing and encryption
- **CORS** (v2.8.5) - Cross-Origin Resource Sharing middleware
- **dotenv** (v16.3.1) - Environment variable management
- **Nodemon** (v3.0.1) - Development utility for auto-restarting server

### Database

- **MongoDB** - NoSQL database for flexible document storage
- **Mongoose ODM** - Object Data Modeling for MongoDB

### AI & APIs

- **Google Generative AI** (v0.2.1) - Google Gemini Flash API for AI-powered learning recommendations and content generation

## Prerequisites

- Node.js v16 or higher
- MongoDB (local installation or MongoDB Atlas cloud database)
- Google Gemini API key (Free tier available at https://makersuite.google.com/app/apikey)

## Installation

1. **Clone the repository and navigate to project directory**

## Installation

1. **Clone the repository and navigate to project directory**

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

## Configuration

### Server Environment Setup

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

**Note**: Obtain your free Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Client Environment Setup

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Seed Sample Data

The project includes a script to populate the database with sample videos:

```bash
cd server
node scripts/seedVideos.js
```

This will add curated YouTube videos to your database for learning resources.

## Running the Application

### Development Mode

**Terminal 1 - Start the Backend Server:**

```bash
cd server
npm run dev
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Start the Frontend Application:**

```bash
cd client
npm start
```

The frontend will start on `http://localhost:3000`

## Project Structure

```
Personalized Learning Path Generator/
├── server/                 # Backend Express.js application
│   ├── config/            # Database and environment configuration
│   ├── models/            # Mongoose schemas and models
│   ├── routes/            # API endpoint definitions
│   ├── middleware/        # Authentication and validation middleware
│   ├── services/          # Business logic (Gemini AI integration)
│   ├── scripts/           # Database seeding scripts
│   ├── index.js           # Server entry point
│   └── package.json
├── client/                # React.js frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context for state management
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── App.js         # Root component
│   │   └── index.js       # React entry point
│   └── package.json
├── README.md              # This file
└── package.json           # Root package configuration
```

## API Endpoints (Key Routes)

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current authenticated user

### Assessments

- `GET /api/assessments` - List all available assessments
- `GET /api/assessments/:id` - Get specific assessment details
- `POST /api/assessments/submit` - Submit assessment answers

### Learning Paths

- `GET /api/learning-paths/:userId` - Retrieve user's personalized learning path
- `POST /api/learning-paths/generate` - Generate a new learning path using AI
- `PUT /api/learning-paths/:id/topic/:topicId` - Mark topic as completed

### Learning Resources

- `GET /api/videos` - Fetch available learning videos
- `GET /api/products` - Get learning resources and documentation

### Activity Tracking & Analytics

- `POST /api/activity/track-time` - Record time spent learning (protected)
- `GET /api/activity/stats` - Get user activity statistics (protected)
- `GET /api/leaderboard` - Get weekly leaderboard rankings

### User Management

- `GET /api/users/:id` - Get user profile details
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/assessments` - Get user's assessment history

## Usage Guide

1. **Create an Account**: Register and log in to the platform
2. **Take Assessments**: Complete skill assessments to evaluate your knowledge in different domains
3. **Generate Learning Path**: Based on your assessment results, the AI generates a personalized learning roadmap
4. **Access Resources**: View curated videos and documentation for each topic in your learning path
5. **Track Progress**: Mark topics as completed and monitor your progress visually
6. **Export Roadmap**: Download your personalized learning path as a PDF for offline reference
7. **Join Leaderboard**: Compete with other learners on the weekly leaderboard

## Features Explained

### AI-Powered Recommendations

The application uses Google Gemini Flash API to intelligently analyze assessment results and recommend optimal learning sequences based on skill gaps and learning objectives.

### Interactive Visualizations

D3.js creates dynamic, interactive visualizations of your learning roadmap, making it easy to understand your learning journey and track progress.

### Time Tracking

Automatically track time spent on learning activities with detailed weekly analytics to help you maintain consistent learning habits.

### Leaderboard System

Compete with fellow learners on a weekly leaderboard based on assessment scores and learning activity to boost engagement and motivation.

## Development

### Project Setup

- Ensure MongoDB is running (locally or via MongoDB Atlas)
- Install all dependencies as described in the Installation section
- Configure environment variables in both `server` and `client` directories

### Code Structure

- **Frontend**: Built with React hooks and Context API for state management
- **Backend**: RESTful API with Express.js and Mongoose for data persistence
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Validation**: Express Validator for input validation and sanitization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

**MongoDB Connection Issues**

- Ensure MongoDB is running on your system
- Check if the `MONGODB_URI` in `.env` is correct
- For MongoDB Atlas, verify your IP address is whitelisted

**API Key Issues**

- Verify your Google Gemini API key is valid and has appropriate permissions
- Check that the API key is properly set in the `.env` file
- Ensure your Google account has enabled the Generative AI API

**Port Already in Use**

- Backend: Change the `PORT` in `.env` file to an available port
- Frontend: React will prompt you to use a different port if 3000 is unavailable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---
