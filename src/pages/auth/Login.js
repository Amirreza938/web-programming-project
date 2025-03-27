import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('لطفا تمام فیلدها را پر کنید');
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">ورود به حساب کاربری</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>ایمیل</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ایمیل خود را وارد کنید"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="password">
                  <div className="d-flex justify-content-between">
                    <Form.Label>رمز عبور</Form.Label>
                    <Link to="/forgot-password" className="text-decoration-none small">
                      فراموشی رمز عبور
                    </Link>
                  </div>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="رمز عبور خود را وارد کنید"
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={loading}
                >
                  {loading ? 'لطفا صبر کنید...' : 'ورود'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  حساب کاربری ندارید؟{' '}
                  <Link to="/register" className="text-decoration-none">
                    ثبت‌نام کنید
                  </Link>
                </p>
                
                <div className="mt-3">
                  <p className="text-muted small">ورود آزمایشی:</p>
                  <p className="text-muted small mb-1">کاربر عادی: user@example.com / password</p>
                  <p className="text-muted small">مدیر: admin@example.com / admin</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
