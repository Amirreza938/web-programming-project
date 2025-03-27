import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaBox, FaShippingFast, FaCheckCircle, FaMapMarkerAlt, FaStore } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching order data
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from your API
        // For demo purposes, we're using mock data
        setTimeout(() => {
          const mockOrder = {
            id: orderId || 'ORD-1234567',
            status: 'shipping',
            customer: 'رضا محمدی',
            date: '1402/08/15',
            estimatedDelivery: '1402/08/20',
            currentLocation: 'مرکز توزیع تهران',
            steps: [
              {
                id: 1, 
                title: 'سفارش ثبت شد', 
                date: '1402/08/15 - 10:30', 
                description: 'سفارش شما با موفقیت ثبت شد و در انتظار تایید است.',
                status: 'completed'
              },
              {
                id: 2, 
                title: 'پردازش سفارش', 
                date: '1402/08/16 - 09:15',
                description: 'سفارش شما توسط فروشنده تایید و آماده‌سازی شد.',
                status: 'completed'
              },
              {
                id: 3, 
                title: 'ارسال سفارش', 
                date: '1402/08/17 - 14:20',
                description: 'سفارش شما تحویل پست داده شد و در حال ارسال است.',
                status: 'current'
              },
              {
                id: 4, 
                title: 'تحویل سفارش', 
                date: '1402/08/20 - در انتظار',
                description: 'سفارش شما به آدرس تعیین شده تحویل داده خواهد شد.',
                status: 'pending'
              }
            ],
            items: [
              { id: 1, name: 'گوشی موبایل سامسونگ', quantity: 1, price: '۱۲,۵۰۰,۰۰۰ تومان' }
            ],
            address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳'
          };
          
          setOrder(mockOrder);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('خطا در دریافت اطلاعات سفارش. لطفاً دوباره تلاش کنید.');
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);
  
  // Function to get appropriate icon for each step
  const getStepIcon = (stepId, status) => {
    if (stepId === 1) return <FaStore />;
    if (stepId === 2) return <FaBox />;
    if (stepId === 3) return <FaShippingFast />;
    if (stepId === 4) return <FaMapMarkerAlt />;
    return <FaCheckCircle />;
  };

  if (loading) return (
    <Container className="my-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-2">در حال بارگذاری اطلاعات سفارش...</p>
      </div>
    </Container>
  );

  if (error) return (
    <Container className="my-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  return (
    <Container className="my-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
              <h4 className="mb-0">پیگیری سفارش: {order?.id}</h4>
            </Card.Header>
            <Card.Body>
              <div className="order-summary mb-4">
                <Row>
                  <Col md={6}>
                    <p><strong>سفارش دهنده:</strong> {order?.customer}</p>
                    <p><strong>تاریخ سفارش:</strong> {order?.date}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>تحویل تا:</strong> {order?.estimatedDelivery}</p>
                    <p><strong>موقعیت فعلی:</strong> {order?.currentLocation}</p>
                  </Col>
                </Row>
              </div>
              
              <h5 className="mb-4">مراحل سفارش</h5>
              <div className="tracking-timeline">
                {order?.steps.map((step) => (
                  <div className="tracking-step" key={step.id}>
                    <div className={`step-icon ${step.status}`}>
                      {getStepIcon(step.id, step.status)}
                    </div>
                    <div className="step-content">
                      <h6 className="step-title">{step.title}</h6>
                      <div className="step-date">{step.date}</div>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h5 className="mb-3">اقلام سفارش</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th>محصول</th>
                        <th>تعداد</th>
                        <th>قیمت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4">
                <h5>آدرس تحویل</h5>
                <p className="mb-0">{order?.address}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderTracking;
