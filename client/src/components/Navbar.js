import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiBookOpen,
  FiLayout,
  FiClipboard,
  FiMap,
  FiUser,
  FiLogIn,
  FiUserPlus,
  FiLogOut
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => setOpen(o => !o);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FiBookOpen className="brand-icon" />
          <span>SkillPath</span>
        </Link>
        <button
          className="navbar-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={toggleMenu}
        >
          <span className="hamburger" />
        </button>

        <div className={`navbar-menu ${open ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                <FiLayout className="nav-icon" />
                <span>Dashboard</span>
              </Link>
              <Link to="/assessments" className="navbar-link">
                <FiClipboard className="nav-icon" />
                <span>Assessments</span>
              </Link>
              <Link to="/learning-path" className="navbar-link">
                <FiMap className="nav-icon" />
                <span>Learning Path</span>
              </Link>
              <Link to="/profile" className="navbar-link">
                <FiUser className="nav-icon" />
                <span>Profile</span>
              </Link>
              <div className="navbar-user">
                <span className="navbar-username">
                  <FiUser className="user-icon" />
                  {user?.name}
                </span>
                <button onClick={handleLogout} className="navbar-logout">
                  <FiLogOut className="logout-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                <FiLogIn className="nav-icon" />
                <span>Login</span>
              </Link>
              <Link to="/register" className="navbar-link navbar-register">
                <FiUserPlus className="nav-icon" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

