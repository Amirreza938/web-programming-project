import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, NavDropdown, Button, Form, FormControl } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaSearch, FaHeart, FaPlus, FaEnvelope, FaShoppingBag } from 'react-icons/fa';

const Header = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value;
    navigate(`/products?search=${query}`);
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fs-4 fw-bold text-primary">
          دیوار دوم
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Form className="d-flex mx-auto" style={{ width: '50%' }} onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="جستجوی محصولات..."
              className="me-2"
              name="search"
            />
            <Button variant="outline-primary" type="submit">
              <FaSearch /> جستجو
            </Button>
          </Form>
          
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/products">محصولات</Nav.Link>
            
            {currentUser ? (
              <>
                <Button 
                  variant="success" 
                  size="sm" 
                  className="mx-2 d-flex align-items-center" 
                  as={Link} 
                  to="/create-listing"
                >
                  <FaPlus className="me-1" /> ثبت آگهی
                </Button>
                
                <NavDropdown 
                  title={
                    <span>
                      <FaUser className="me-1" /> {currentUser.name}
                    </span>
                  } 
                  id="basic-nav-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/dashboard">داشبورد من</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-listings">آگهی‌های من</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/favorites">
                    <FaHeart className="me-1" /> علاقه‌مندی‌ها
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/messages">
                    <FaEnvelope className="me-1" /> پیام‌ها
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/profile">تنظیمات حساب</NavDropdown.Item>
                  
                  {isAdmin && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={Link} to="/admin">پنل مدیریت</NavDropdown.Item>
                    </>
                  )}
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>
                    <FaSignOutAlt className="me-1" /> خروج
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">ورود</Nav.Link>
                <Nav.Link as={Link} to="/register">ثبت‌نام</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
