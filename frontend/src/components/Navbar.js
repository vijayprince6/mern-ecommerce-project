import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import ImageModal from './ImageModal';
import './Navbar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [showLogoModal, setShowLogoModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
      
      // Listen for cart updates
      const handleCartUpdate = () => {
        fetchCartCount();
      };
      window.addEventListener('cartUpdated', handleCartUpdate);
      
      // Refresh cart count every 3 seconds as backup
      const interval = setInterval(() => {
        fetchCartCount();
      }, 3000);
      
      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      if (response.data && response.data.items) {
        const total = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('You logout successfully');
    navigate('/');
    setMenuOpen(false);
    setCartCount(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.toLowerCase().trim();
    if (term === 'balls' || term === 'ball') {
      navigate('/balls');
    } else if (term === 'bats' || term === 'bat') {
      navigate('/bats');
    } else if (term === 'jersey' || term === 'jerseys') {
      navigate('/jersey');
    } else {
      toast.info('Please search for: balls, bats, or jersey');
    }
    setSearchTerm('');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo on left */}
        <div className="navbar-logo-container">
          <Link to="/" className="navbar-logo">
            <img 
              src="/assets/logo.png" 
              alt="Sport Land Logo" 
              className="logo-image"
              onClick={(e) => {
                e.preventDefault();
                setShowLogoModal(true);
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span style={{display: 'none'}}>Sport Land</span>
          </Link>
        </div>

        {/* Center Navigation */}
        <div className="navbar-center">
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/bats" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Bats
          </Link>
          <Link to="/balls" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Balls
          </Link>
          <Link to="/jersey" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Jersey
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="navbar-search">
          <input
            type="text"
            placeholder="Search balls, bats, jersey..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        {/* Right side menu */}
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <span className="navbar-greeting">Hi {user?.name}</span>
              <Link to="/cart" className="navbar-link cart-link" onClick={() => setMenuOpen(false)}>
                Cart
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <button className="navbar-link btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-link navbar-link-register" onClick={() => setMenuOpen(false)}>
              Login/Sign up
            </Link>
          )}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      {showLogoModal && (
        <ImageModal
          image="/assets/logo.png"
          onClose={() => setShowLogoModal(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
