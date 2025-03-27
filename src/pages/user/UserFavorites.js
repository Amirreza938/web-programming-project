import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrash, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

// Mock data import - replace with API calls in production
import { products } from '../../data/mockData';

const UserFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fetch user favorites from localStorage
    const fetchFavorites = () => {
      setLoading(true);
      try {
        const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // Find the full product data for each favorite ID
        const favoriteProducts = products.filter(product => 
          storedFavorites.includes(product.id.toString())
        );
        
        setFavorites(favoriteProducts);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('خطا در بارگذاری علاقه‌مندی‌ها');
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  const removeFromFavorites = (productId) => {
    try {
      const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const updatedFavorites = storedFavorites.filter(id => id !== productId.toString());
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      // Update the state
      setFavorites(favorites.filter(product => product.id.toString() !== productId.toString()));
      
      toast.info('از علاقه‌مندی‌ها حذف شد');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('خطا در حذف از علاقه‌مندی‌ها');
    }
  };

  const clearAllFavorites = () => {
    try {
      localStorage.setItem('favorites', JSON.stringify([]));
      setFavorites([]);
      toast.info('تمام علاقه‌مندی‌ها حذف شدند');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      toast.error('خطا در حذف علاقه‌مندی‌ها');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">علاقه‌مندی‌های من</h2>
        {favorites.length > 0 && (
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={clearAllFavorites}
          >
            حذف همه
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaRegHeart size={50} className="text-muted mb-3" />
            <h4>لیست علاقه‌مندی‌های شما خالی است</h4>
            <p className="text-muted">محصولات مورد علاقه خود را با کلیک روی نشان قلب به این لیست اضافه کنید</p>
            <Button as={Link} to="/products" variant="primary">
              مشاهده محصولات
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {favorites.map(product => (
            <Col key={product.id} lg={4} md={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Link to={`/products/${product.id}`}>
                  <Card.Img 
                    variant="top" 
                    src={product.image || 'https://via.placeholder.com/300x200'} 
                    alt={product.title} 
                  />
                </Link>
                <Card.Body className="d-flex flex-column">
                  <Card.Title as={Link} to={`/products/${product.id}`} className="text-decoration-none text-dark">
                    {product.title}
                  </Card.Title>
                  <Card.Text className="text-primary fw-bold mt-auto">
                    {product.price.toLocaleString()} تومان
                  </Card.Text>
                  <Button 
                    variant="outline-danger" 
                    className="mt-2"
                    onClick={() => removeFromFavorites(product.id)}
                  >
                    <FaTrash className="me-2" />
                    حذف از علاقه‌مندی‌ها
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default UserFavorites;
