import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';

// Mock data
import { products } from '../../data/mockData';

const SimilarProducts = ({ category, currentProductId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  
  useEffect(() => {
    // Filter products by category and exclude current product
    const filtered = products
      .filter(product => product.category === category && product.id.toString() !== currentProductId.toString())
      .slice(0, 4); // Get up to 4 similar products
      
    setSimilarProducts(filtered);
  }, [category, currentProductId]);
  
  if (similarProducts.length === 0) {
    return null;
  }
  
  return (
    <Row>
      {similarProducts.map(product => (
        <Col key={product.id} md={3} sm={6} className="mb-4">
          <Card className="h-100 product-card border-0 shadow-sm">
            <Link to={`/products/${product.id}`}>
              <Card.Img 
                variant="top" 
                src={product.image} 
                className="product-image"
              />
            </Link>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <Badge bg={product.condition === 'نو' ? 'success' : product.condition === 'در حد نو' ? 'info' : 'warning'}>
                  {product.condition}
                </Badge>
                <small className="text-muted">{product.date}</small>
              </div>
              <Link to={`/products/${product.id}`} className="text-decoration-none">
                <Card.Title className="product-title text-dark">{product.title}</Card.Title>
              </Link>
              <Card.Text className="product-price">
                {product.price.toLocaleString()} تومان
              </Card.Text>
              <div className="product-meta">
                <div className="product-location">
                  <FaMapMarkerAlt className="me-1 text-danger" />
                  {product.location}
                </div>
                <div>
                  <FaStar className="text-warning" />
                  <small className="ms-1">{product.rating}</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SimilarProducts;
