import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { bats } from '../data/data';
import ProductCard from '../components/ProductCard';
import ImageModal from '../components/ImageModal';
import axios from 'axios';
import './Bats.css';

// Function to refresh cart count in navbar
const refreshCartCount = () => {
  window.dispatchEvent(new Event('cartUpdated'));
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Bats = () => {
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
        category: 'bats',
        brand: product.company,
        image: product.img,
        stock: 10
      };

      let productId = product._id;
      if (!productId) {
        const createResponse = await axios.post(`${API_URL}/products`, productData);
        productId = createResponse.data._id;
      }

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
      await handleAddToCart(product);
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="bats-page">
      <div className="container">
        <h1 className="page-title">Bats</h1>
        <div className="products-grid">
          {bats.map((bat) => (
            <ProductCard
              key={bat.id}
              product={bat}
              onAddToCart={() => handleAddToCart(bat)}
              onBuy={() => handleBuy(bat)}
              onImageClick={() => setSelectedImage(bat.img)}
            />
          ))}
        </div>
        {bats.length === 0 && (
          <p className="text-center">No bats available</p>
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

export default Bats;
