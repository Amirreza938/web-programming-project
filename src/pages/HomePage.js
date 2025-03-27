import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Container, Card, Badge, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import CategoryList from '../components/category/CategoryList';

// Mock data for the demo
import { featuredProducts, categories } from '../data/mockData';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use mock data
    setProducts(featuredProducts);
  }, []);

  return (
    <>
      {/* Hero section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold mb-4">خرید و فروش امن کالاهای دست دوم</h1>
              <p className="fs-5 mb-4">
                در دیوار دوم میتوانید به راحتی کالای دست دوم خود را آگهی کنید یا از بین هزاران آگهی معتبر، محصول مورد نظرتان را پیدا کنید.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Button as={Link} to="/products" size="lg" variant="light" className="text-primary">
                  مشاهده آگهی‌ها
                </Button>
                <Button as={Link} to="/register" size="lg" variant="outline-light">
                  عضویت رایگان
                </Button>
              </div>
            </Col>
            <Col md={6} className="mt-4 mt-md-0 text-center">
              <img 
                src="https://via.placeholder.com/600x400" 
                alt="دیوار دوم" 
                className="img-fluid rounded shadow"
                style={{ maxHeight: '350px' }}
              />
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Categories section */}
      <Container className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>دسته‌بندی ها</h2>
          <Link to="/products" className="text-decoration-none">
            مشاهده همه <FaArrowLeft className="ms-1" />
          </Link>
        </div>
        <CategoryList categories={categories} />
      </Container>
      
      {/* Featured products section */}
      <Container className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>آگهی‌های ویژه</h2>
          <Link to="/products" className="text-decoration-none">
            مشاهده همه <FaArrowLeft className="ms-1" />
          </Link>
        </div>
        <Row>
          {products.map(product => (
            <Col key={product.id} md={3} sm={6} className="mb-4">
              <Card className="h-100 product-card border-0 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={product.image} 
                  className="product-image"
                />
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge bg={product.condition === 'نو' ? 'success' : product.condition === 'در حد نو' ? 'info' : 'warning'}>
                      {product.condition}
                    </Badge>
                    <small className="text-muted">
                      <FaCalendarAlt className="me-1" />
                      {product.date}
                    </small>
                  </div>
                  <Card.Title>{product.title}</Card.Title>
                  <Card.Text className="text-primary fw-bold">
                    {product.price.toLocaleString()} تومان
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <FaMapMarkerAlt className="me-1" />
                      {product.location}
                    </small>
                    <div>
                      <FaStar className="text-warning" />
                      <small className="ms-1">{product.rating}</small>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <Button 
                    as={Link}
                    to={`/products/${product.id}`}
                    variant="outline-primary" 
                    className="w-100"
                  >
                    مشاهده آگهی
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      
      {/* How it works section */}
      <Container className="mb-5 py-5 bg-light rounded">
        <h2 className="text-center mb-5">چگونه کار می‌کند؟</h2>
        <Row className="text-center">
          <Col md={4} className="mb-4 mb-md-0">
            <div className="bg-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
              <h1 className="mb-0 text-primary">1</h1>
            </div>
            <h4>ثبت آگهی</h4>
            <p className="text-muted">کالای خود را با عکس و توضیحات کامل ثبت کنید</p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <div className="bg-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
              <h1 className="mb-0 text-primary">2</h1>
            </div>
            <h4>چت و مذاکره</h4>
            <p className="text-muted">با خریداران گفتگو کنید و به توافق برسید</p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <div className="bg-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
              <h1 className="mb-0 text-primary">3</h1>
            </div>
            <h4>فروش و تحویل</h4>
            <p className="text-muted">کالا را به خریدار تحویل دهید و پرداخت را دریافت کنید</p>
          </Col>
        </Row>
      </Container>
      
      {/* Testimonials */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">نظرات کاربران</h2>
        <Carousel variant="dark" indicators={false}>
          <Carousel.Item>
            <div className="bg-white p-4 rounded shadow-sm mx-auto text-center" style={{ maxWidth: '700px' }}>
              <p className="fs-5">
                "از طریق دیوار دوم توانستم لپ تاپ مورد نظرم را با قیمت مناسب پیدا کنم. سیستم چت داخلی برای مذاکره بسیار راحت بود."
              </p>
              <div className="d-flex justify-content-center align-items-center mt-3">
                <img
                  src="https://via.placeholder.com/50"
                  alt="کاربر"
                  className="rounded-circle me-3"
                />
                <div className="text-start">
                  <h5 className="mb-0">علی محمدی</h5>
                  <div className="text-warning">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                </div>
              </div>
            </div>
          </Carousel.Item>
          <Carousel.Item>
            <div className="bg-white p-4 rounded shadow-sm mx-auto text-center" style={{ maxWidth: '700px' }}>
              <p className="fs-5">
                "به عنوان فروشنده تجربه خوبی داشتم. وسایل خانه را که استفاده نمی‌کردم به راحتی فروختم و فضای خانه را خلوت کردم."
              </p>
              <div className="d-flex justify-content-center align-items-center mt-3">
                <img
                  src="https://via.placeholder.com/50"
                  alt="کاربر"
                  className="rounded-circle me-3"
                />
                <div className="text-start">
                  <h5 className="mb-0">مریم حسینی</h5>
                  <div className="text-warning">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                </div>
              </div>
            </div>
          </Carousel.Item>
        </Carousel>
      </Container>
    </>
  );
};

export default HomePage;
