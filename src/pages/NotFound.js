import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="mb-4 text-warning">
            <FaExclamationTriangle size={80} />
          </div>
          <h1 className="mb-4">صفحه مورد نظر یافت نشد</h1>
          <p className="lead mb-4">
            متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
          </p>
          <div>
            <Button as={Link} to="/" variant="primary" size="lg" className="me-3">
              <FaHome className="me-2" /> بازگشت به صفحه اصلی
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
