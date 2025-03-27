import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaInstagram, FaTelegram, FaTwitter, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5 className="mb-4">دیوار دوم</h5>
            <p>
              پلتفرم خرید و فروش محصولات دست دوم با امکان ثبت آگهی رایگان، چت مستقیم با فروشنده و خریدار، و سیستم پرداخت امن.
            </p>
            <div className="d-flex mt-3">
              <a href="#" className="text-white me-3"><FaInstagram size={24} /></a>
              <a href="#" className="text-white me-3"><FaTelegram size={24} /></a>
              <a href="#" className="text-white me-3"><FaTwitter size={24} /></a>
            </div>
          </Col>
          <Col md={4}>
            <h5 className="mb-4">لینک‌های مفید</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-white">صفحه اصلی</Link></li>
              <li className="mb-2"><Link to="/products" className="text-white">محصولات</Link></li>
              <li className="mb-2"><Link to="/about" className="text-white">درباره ما</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-white">تماس با ما</Link></li>
              <li className="mb-2"><Link to="/faq" className="text-white">سوالات متداول</Link></li>
              <li className="mb-2"><Link to="/rules" className="text-white">قوانین و مقررات</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5 className="mb-4">تماس با ما</h5>
            <div className="d-flex align-items-center mb-3">
              <FaPhoneAlt className="me-2" />
              <span>۰۲۱-۸۸۸۸۸۸۸۸</span>
            </div>
            <div className="d-flex align-items-center mb-3">
              <FaEnvelope className="me-2" />
              <span>info@divardovom.ir</span>
            </div>
            <div className="d-flex align-items-center mb-3">
              <FaMapMarkerAlt className="me-2" />
              <span>تهران، خیابان ولیعصر، پلاک ۱۰۰</span>
            </div>
          </Col>
        </Row>
        <hr className="mt-4" />
        <div className="text-center">
          <p>تمام حقوق این سایت محفوظ است. &copy; دیوار دوم ۱۴۰۲</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
