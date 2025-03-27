import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUser, FaListAlt, FaHeart, FaEnvelope, FaEye, FaShoppingCart, FaPlus, FaSignOutAlt, FaChartLine, FaMoneyBillWave, FaUserEdit } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">داشبورد کاربری</h1>
      
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card">
            <div className="text-center">
              <div className="stat-icon">
                <FaListAlt />
              </div>
              <div className="stat-value">۵</div>
              <div className="stat-label">آگهی فعال</div>
            </div>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card">
            <div className="text-center">
              <div className="stat-icon">
                <FaEye />
              </div>
              <div className="stat-value">۱۲۳</div>
              <div className="stat-label">بازدید از آگهی‌ها</div>
            </div>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card">
            <div className="text-center">
              <div className="stat-icon">
                <FaHeart />
              </div>
              <div className="stat-value">۸</div>
              <div className="stat-label">علاقه‌مندی‌ها</div>
            </div>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-4 mb-lg-0">
          <Card className="dashboard-stat-card">
            <div className="text-center">
              <div className="stat-icon">
                <FaEnvelope />
              </div>
              <div className="stat-value">۳</div>
              <div className="stat-label">پیام‌های جدید</div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <FaUser className="bg-primary text-white p-3 rounded-circle" style={{fontSize: '3rem'}} />
              </div>
              <h5>{currentUser.name}</h5>
              <p className="text-muted">{currentUser.email}</p>
              
              <div className="d-grid gap-2 mt-4">
                <Button as={Link} to="/profile" variant="outline-primary">
                  <FaUserEdit className="me-2" /> ویرایش پروفایل
                </Button>
                <Button variant="outline-danger" onClick={logout}>
                  <FaSignOutAlt className="me-2" /> خروج از حساب کاربری
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">آگهی‌های اخیر</h5>
                <Button as={Link} to="/my-listings" variant="link" className="p-0">مشاهده همه</Button>
              </div>
              
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://via.placeholder.com/50" 
                      alt="محصول" 
                      className="rounded me-3" 
                    />
                    <div>
                      <div className="fw-bold mb-1">گوشی سامسونگ گلکسی S21</div>
                      <div className="text-muted small">۱۵,۰۰۰,۰۰۰ تومان</div>
                    </div>
                  </div>
                  <Badge bg="success">فعال</Badge>
                </ListGroup.Item>
                
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://via.placeholder.com/50" 
                      alt="محصول" 
                      className="rounded me-3" 
                    />
                    <div>
                      <div className="fw-bold mb-1">لپ تاپ اپل مک بوک پرو ۲۰۲۰</div>
                      <div className="text-muted small">۴۵,۰۰۰,۰۰۰ تومان</div>
                    </div>
                  </div>
                  <Badge bg="success">فعال</Badge>
                </ListGroup.Item>
                
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://via.placeholder.com/50" 
                      alt="محصول" 
                      className="rounded me-3" 
                    />
                    <div>
                      <div className="fw-bold mb-1">دوچرخه کوهستان Specialized</div>
                      <div className="text-muted small">۱۸,۰۰۰,۰۰۰ تومان</div>
                    </div>
                  </div>
                  <Badge bg="warning" text="dark">در انتظار تایید</Badge>
                </ListGroup.Item>
              </ListGroup>
              
              <div className="mt-3">
                <Button as={Link} to="/create-listing" className="w-100">
                  <FaPlus className="me-2" /> ثبت آگهی جدید
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">پیام‌های اخیر</h5>
                <Button as={Link} to="/messages" variant="link" className="p-0">مشاهده همه</Button>
              </div>
              
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FaUser className="me-3 text-primary" />
                    <div>
                      <div className="fw-bold mb-1">علی محمدی</div>
                      <div className="text-muted small">آیا این محصول هنوز موجود است؟</div>
                    </div>
                  </div>
                  <div className="text-muted small">۲ ساعت پیش</div>
                </ListGroup.Item>
                
                <ListGroup.Item className="px-0 py-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FaUser className="me-3 text-primary" />
                    <div>
                      <div className="fw-bold mb-1">مریم حسینی</div>
                      <div className="text-muted small">بابت خرید سریع و تحویل به موقع، ممنونم.</div>
                    </div>
                  </div>
                  <div className="text-muted small">دیروز</div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;
