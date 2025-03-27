import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      return setError('لطفا تمام فیلدها را پر کنید');
    }
    
    if (password !== confirmPassword) {
      return setError('رمزهای عبور یکسان نیستند');
    }
    
    if (password.length < 6) {
      return setError('رمز عبور باید حداقل 6 کاراکتر باشد');
    }
    
    try {
      setError('');
      setLoading(true);
      await register(name, email, password);
      navigate('/dashboard');
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
              <h2 className="text-center mb-4">ثبت‌نام در دیوار دوم</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>نام و نام خانوادگی</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                  />
                </Form.Group>
                
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
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>رمز عبور</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="رمز عبور را وارد کنید"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="confirmPassword">
                  <Form.Label>تکرار رمز عبور</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="رمز عبور را مجددا وارد کنید"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="terms">
                  <Form.Check 
                    type="checkbox"
                    label={
                      <span>
                        با <Link to="/terms" className="text-decoration-none">قوانین و مقررات</Link> سایت موافق هستم
                      </span>
                    }
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={loading}
                >
                  {loading ? 'لطفا صبر کنید...' : 'ثبت‌نام'}
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <p>
                  قبلا ثبت‌نام کرده‌اید؟{' '}
                  <Link to="/login" className="text-decoration-none">
                    وارد شوید
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
