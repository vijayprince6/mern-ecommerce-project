import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { balls } from '../data/data';
import ProductCard from '../components/ProductCard';
import ImageModal from '../components/ImageModal';
import axios from 'axios';
import './Balls.css';

// Function to refresh cart count in navbar
const refreshCartCount = () => {
  window.dispatchEvent(new Event('cartUpdated'));
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Balls = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      if (window.confirm('Please Login/Sign up first. Click OK to go to login page.')) {
        navigate('/login');
      }
      return;
    }

    try {
      // First, check if product exists in database or create it
      const productData = {
        name: product.name,
        description: `${product.name} by ${product.company}`,
        price: product.price,
        category: 'balls',
        brand: product.company,
        image: product.img,
        stock: 10
      };

      // Try to find existing product or create new one
      let productId = product._id;
      if (!productId) {
        // Create product in database
        const createResponse = await axios.post(`${API_URL}/products`, productData);
        productId = createResponse.data._id;
      }

      // Add to cart
      await axios.post(`${API_URL}/cart`, {
        productId,
        quantity: 1
      });
      // Refresh cart count in navbar
      refreshCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuy = async (product) => {
    if (!isAuthenticated) {
      if (window.confirm('Please Login/Sign up first. Click OK to go to login page.')) {
        navigate('/login');
      }
      return;
    }

    try {
      // Add to cart first
      await handleAddToCart(product);
      // Navigate to cart
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="balls-page">
      <div className="container">
        <h1 className="page-title">Balls</h1>
        <div className="products-grid">
          {balls.map((ball) => (
            <ProductCard
              key={ball.id}
              product={ball}
              onAddToCart={() => handleAddToCart(ball)}
              onBuy={() => handleBuy(ball)}
              onImageClick={() => setSelectedImage(ball.img)}
            />
          ))}
        </div>
        {balls.length === 0 && (
          <p className="text-center">No balls available</p>
        )}
      </div>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Balls;
