import React from 'react';
// removed unused imports (Link and useAuth) — hero actions were removed
import {
  FiClipboard,
  FiZap,
  FiMap,
  FiTrendingUp,
  FiFileText,
  FiUser
} from 'react-icons/fi';
import './Home.css';
import ProductList from '../components/ProductList';

const Home = () => {
  // hero shows only title and subtitle now; authentication not needed here

  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="hero-title">SkillPath</h1>
        <p className="hero-subtitle">
          Learn smarter. Progress faster. Succeed your way.
        </p>
        {/* Only show title and tagline in hero - action buttons removed */}
      </div>

      <div className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-primary">
              <FiClipboard />
            </div>
            <h3>Skill Assessments</h3>
            <p>Take comprehensive quizzes to evaluate your knowledge in various subjects</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-success">
              <FiZap />
            </div>
            <h3>AI Recommendations</h3>
            <p>Get personalized learning paths powered by Claude AI based on your assessment results</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-info">
              <FiMap />
            </div>
            <h3>Visual Roadmap</h3>
            <p>Interactive D3.js visualization of your learning journey with dependencies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-warning">
              <FiTrendingUp />
            </div>
            <h3>Progress Tracking</h3>
            <p>Mark topics as completed and track your learning progress in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-danger">
              <FiFileText />
            </div>
            <h3>PDF Export</h3>
            <p>Export your personalized learning roadmap as a PDF for offline reference</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-primary">
              <FiUser />
            </div>
            <h3>User Profiles</h3>
            <p>Save your assessment history and learning paths in your profile</p>
          </div>
        </div>
      </div>
      <div className="products-section">
        <ProductList />
      </div>
    </div>
  );
};

export default Home;

