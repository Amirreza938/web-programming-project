import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaMobileAlt, FaLaptop, FaHome, FaTv, FaCar, FaCouch, FaTshirt, FaFutbol } from 'react-icons/fa';

const CategoryList = ({ categories }) => {
  // Function to get the appropriate icon for each category
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'mobile-alt':
        return <FaMobileAlt size={36} />;
      case 'laptop':
        return <FaLaptop size={36} />;
      case 'home':
        return <FaHome size={36} />;
      case 'tv':
        return <FaTv size={36} />;
      case 'car':
        return <FaCar size={36} />;
      case 'couch':
        return <FaCouch size={36} />;
      case 'tshirt':
        return <FaTshirt size={36} />;
      case 'futbol':
        return <FaFutbol size={36} />;
      default:
        return <FaHome size={36} />;
    }
  };

  return (
    <Row>
      {categories.map(category => (
        <Col key={category.id} lg={3} md={4} sm={6} className="mb-4">
          <Link to={`/products?category=${category.name}`} className="text-decoration-none">
            <Card className="category-card h-100 border-0 transition-hover">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                <div className="category-icon mb-3 text-primary">
                  {getCategoryIcon(category.icon)}
                </div>
                <h5 className="category-name mb-2">{category.name}</h5>
                <p className="text-muted mb-0">{category.count} آگهی</p>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};

export default CategoryList;
