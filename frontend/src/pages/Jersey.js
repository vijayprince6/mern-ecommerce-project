import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { jerseys } from '../data/data';
import ProductCard from '../components/ProductCard';
import ImageModal from '../components/ImageModal';
import axios from 'axios';
import './Jersey.css';

// Function to refresh cart count in navbar
const refreshCartCount = () => {
  window.dispatchEvent(new Event('cartUpdated'));
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Jersey = () => {
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
      const productData = {
        name: product.name,
        description: `${product.name} by ${product.company}`,
        price: product.price,
        category: 'jersey',
        brand: product.company,
        image: product.img
      };

      let productId = product._id;
      if (!productId) {
        const createResponse = await axios.post(`${API_URL}/products`, productData);
        productId = createResponse.data._id;
      }

      // Add to cart (no stock checks - users can buy unlimited times)
      await axios.post(`${API_URL}/cart`, {
        productId,
        quantity: 1
      });
      // Refresh cart count in navbar
      refreshCartCount();
      toast.success('Added to cart successfully!');
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
      const productData = {
        name: product.name,
        description: `${product.name} by ${product.company}`,
        price: product.price,
        category: 'jersey',
        brand: product.company,
        image: product.img
      };

      let productId = product._id;
      if (!productId) {
        const createResponse = await axios.post(`${API_URL}/products`, productData);
        productId = createResponse.data._id;
      }

      // Add to cart (no stock checks - users can buy unlimited times)
      await axios.post(`${API_URL}/cart`, {
        productId,
        quantity: 1
      });
      
      // Refresh cart count in navbar
      refreshCartCount();
      toast.success('Added to cart! Redirecting to cart...');
      
      // Navigate to cart after a short delay
      setTimeout(() => {
        navigate('/cart');
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="jersey-page">
      <div className="container">
        <h1 className="page-title">Jerseys</h1>
        <div className="products-grid">
          {jerseys.map((jersey) => (
            <ProductCard
              key={jersey.id}
              product={jersey}
              onAddToCart={() => handleAddToCart(jersey)}
              onBuy={() => handleBuy(jersey)}
              onImageClick={() => setSelectedImage(jersey.img)}
            />
          ))}
        </div>
        {jerseys.length === 0 && (
          <p className="text-center">No jerseys available</p>
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

export default Jersey;
