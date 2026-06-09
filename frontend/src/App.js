import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Balls from './pages/Balls';
import Bats from './pages/Bats';
import Jersey from './pages/Jersey';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Payment from './pages/Payment';
import DeliveryDetails from './pages/DeliveryDetails';

import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// ✅ ProtectedRoute: checks MongoDB Atlas auth state
// - If still loading (verifying token with DB) → show nothing
// - If NOT logged in (new user / no token) → redirect to /register
// - If logged in (old user, token verified) → show the page
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Wait while token is being verified with MongoDB

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Public routes — anyone can visit */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/balls" element={<Balls />} />
              <Route path="/bats" element={<Bats />} />
              <Route path="/jersey" element={<Jersey />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 🔒 Protected routes — only logged-in users */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/delivery-details" element={<ProtectedRoute><DeliveryDetails /></ProtectedRoute>} />
            </Routes>
          </main>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
