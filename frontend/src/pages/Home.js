import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Sports Land</h1>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="intro-grid">
            <Link to="/bats" className="intro-card">
              <img
                src={require('../assets/bats/introbats.png')}
                alt="Bats"
                className="intro-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300';
                }}
              />
              <h2>Bats</h2>
            </Link>
            <Link to="/balls" className="intro-card">
              <img
                src={require('../assets/balls/introballs.png')}
                alt="Balls"
                className="intro-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300';
                }}
              />
              <h2>Balls</h2>
            </Link>
            <Link to="/jersey" className="intro-card">
              <img
                src={require('../assets/jersey/introjersey.png')}
                alt="Jerseys"
                className="intro-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300';
                }}
              />
              <h2>Jerseys</h2>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
