import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductListing from './pages/product/ProductListing';
import ProductDetails from './pages/product/ProductDetails';
import CreateListing from './pages/product/CreateListing';
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import UserListings from './pages/user/UserListings';
import UserFavorites from './pages/user/UserFavorites';
import UserMessages from './pages/user/UserMessages';
import Conversation from './pages/user/Conversation';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderTracking from './pages/orders/OrderTracking';
import NotFound from './pages/NotFound';

// Auth protection
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <>
      <Header />
      <Container className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-listings" element={<UserListings />} />
            <Route path="/favorites" element={<UserFavorites />} />
            <Route path="/messages" element={<UserMessages />} />
            <Route path="/messages/:id" element={<Conversation />} />
            <Route path="/orders/track/:id" element={<OrderTracking />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Footer />
    </>
  );
}

export default App;
