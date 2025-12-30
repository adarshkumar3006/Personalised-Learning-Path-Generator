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

   ```bash
   git clone <repository-url>
   cd "Personalized Learning Path Generator"
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/learning-path-generator
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

   Create a `.env` file in the `client` directory:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**

   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**

   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend (port 3000).

## Demo Account

- **Email**: demo@example.com
- **Password**: demo123

## Project Structure

```
Personalized Learning Path Generator/
├── server/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── index.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   └── public/
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Assessments

- `GET /api/assessments` - Get all available assessments
- `GET /api/assessments/:id` - Get specific assessment
- `POST /api/assessments/submit` - Submit assessment results

### Learning Paths

- `GET /api/learning-paths/:userId` - Get user's learning path
- `POST /api/learning-paths/generate` - Generate new learning path
- `PUT /api/learning-paths/:id/topic/:topicId` - Update topic completion status

## Usage

1. **Register/Login**: Create an account or use the demo account
2. **Take Assessment**: Complete skill assessments for different subjects
3. **View Learning Path**: AI-generated personalized learning roadmap
4. **Track Progress**: Mark topics as completed as you learn
5. **Export PDF**: Download your learning roadmap as PDF

## License

MIT
