import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>
        <div className="profile-card card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            {user.role === 'admin' && (
              <span className="badge-admin">Admin</span>
            )}
          </div>
          <div className="profile-details">
            {user.address && (
              <div className="detail-section">
                <h3>Address</h3>
                <p>
                  {user.address.street && `${user.address.street}, `}
                  {user.address.city && `${user.address.city}, `}
                  {user.address.state && `${user.address.state} `}
                  {user.address.zipCode && `${user.address.zipCode}`}
                  {user.address.country && `, ${user.address.country}`}
                </p>
              </div>
            )}
            {user.phone && (
              <div className="detail-section">
                <h3>Phone</h3>
                <p>{user.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


