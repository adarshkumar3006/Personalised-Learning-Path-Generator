# Personalized Learning Path Generator

A comprehensive MERN stack application that generates custom learning paths for users based on skill assessments and AI-powered recommendations using Claude API.

## Features

- **Skill Assessments**: Interactive quiz modules for various subjects (JavaScript, Databases, etc.)
- **AI Recommendations**: Claude API integration for intelligent learning path suggestions
- **Dynamic Roadmap**: Interactive D3.js visualization of learning paths
- **Progress Tracking**: Mark topics as completed and track learning progress
- **PDF Export**: Export personalized learning roadmap as PDF
- **User Profiles**: MongoDB-based user management with assessment history

## Tech Stack

- **Frontend**: React.js, D3.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini Flash API (Free)
- **PDF**: jsPDF, html2canvas

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Gemini API key (Free - Get from https://makersuite.google.com/app/apikey)

## Installation

1. **Clone the repository**

# Personalized Learning Path Generator

Personalized Learning Path Generator is a MERN stack application that creates tailored learning paths for users based on skill assessments, tracks progress, and provides curated video and documentation resources.

Overview

This project provides:

- Skill assessments to evaluate user knowledge
- AI-assisted recommendations for generating personalized learning paths
- Video resources and progress tracking
- Time spent tracking and a weekly leaderboard
- User profiles with assessment history and reviews

Tech stack

- Frontend: React
- Backend: Node.js and Express
- Database: MongoDB (Mongoose)
- Optional: Google Gemini / Claude for AI-assisted recommendations

Prerequisites

- Node.js v16 or newer
- MongoDB (local or Atlas)

Installation

1. Clone the repository and change into the project folder

2. Install server dependencies

   cd server
   npm install

3. Install client dependencies

   cd ../client
   npm install

Configuration

Create a .env file in the server folder with the following variables

PORT=5000
MONGODB_URI=mongodb://localhost:27017/learning-path-generator
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here

Create a .env file in the client folder with

REACT_APP_API_URL=http://localhost:5000/api

Seeding sample videos

The project contains a server/scripts/seedVideos.js script that upserts a curated list of YouTube videos into the database. Run it after starting the backend to populate video data.

Run the application (development)

Start the backend

cd server
npm run dev

Start the frontend in a separate terminal

cd client
npm start

Project structure (high level)

Personalized Learning Path Generator/
server/ - backend code, routes, models and scripts
client/ - React application and UI components
README.md - this file

API endpoints (selected)

Authentication

POST /api/auth/register - register a new user
POST /api/auth/login - login
GET /api/auth/me - get current user

Assessments

GET /api/assessments - list assessments
GET /api/assessments/:id - get assessment
POST /api/assessments/submit - submit assessment answers

Learning paths

GET /api/learning-paths/:userId - fetch user's learning path
POST /api/learning-paths/generate - generate learning path
PUT /api/learning-paths/:id/topic/:topicId - toggle topic completion

Activity and leaderboard

POST /api/activity/track-time - record seconds of time spent (protected)
GET /api/activity/stats - get user time and stats (protected)
GET /api/leaderboard - get current week leaderboard

Usage notes

- Complete an assessment to generate a learning path
- Watch videos using the YouTube player; progress is tracked and saved
- Use reviews and feedback to rate assessments and learning paths

License

MIT
