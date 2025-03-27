import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaArrowRight, FaUserCircle, FaPaperPlane, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

// Sample mock data
const mockSellers = {
  'seller123': { 
    id: 'seller123',
    name: 'علی محمدی', 
    avatar: null,
    lastSeen: 'آنلاین'
  },
  'seller456': { 
    id: 'seller456',
    name: 'سارا احمدی', 
    avatar: null,
    lastSeen: '10 دقیقه پیش'
  },
  'seller789': { 
    id: 'seller789',
    name: 'رضا کریمی', 
    avatar: null,
    lastSeen: '1 ساعت پیش'
  }
};

const mockMessages = {
  'seller123': [
    {
      id: 1,
      senderId: 'user',
      text: 'سلام، محصول هنوز موجود هست؟',
      timestamp: '10:20',
      date: '1401/08/12',
    },
    {
      id: 2,
      senderId: 'seller123',
      text: 'سلام، بله موجود هست',
      timestamp: '10:22',
      date: '1401/08/12',
    },
    {
      id: 3,
      senderId: 'seller123',
      text: 'می‌تونید همین امروز تشریف بیارید و محصول رو ببینید',
      timestamp: '10:23',
      date: '1401/08/12',
    },
  ],
  'seller456': [
    {
      id: 1,
      senderId: 'user',
      text: 'سلام. امکان ارسال به شهرستان دارید؟',
      timestamp: '15:40',
      date: '1401/08/11',
    },
    {
      id: 2,
      senderId: 'seller456',
      text: 'سلام، وقت بخیر',
      timestamp: '15:45',
      date: '1401/08/11',
    },
    {
      id: 3,
      senderId: 'seller456',
      text: 'بله، امکان ارسال به شهرستان هم داریم',
      timestamp: '15:46',
      date: '1401/08/11',
    },
  ],
  'seller789': [
    {
      id: 1,
      senderId: 'user',
      text: 'سلام. قیمت نهایی چقدر هست؟',
      timestamp: '09:15',
      date: '1401/08/05',
    },
  ]
};

const Conversation = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [seller, setSeller] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch seller and messages data
    const fetchData = () => {
      setLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        const sellerData = mockSellers[id];
        const messagesData = mockMessages[id] || [];
        
        if (sellerData) {
          setSeller(sellerData);
          setMessages(messagesData);
        }
        
        setLoading(false);
      }, 800);
    };

    fetchData();
  }, [id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') {
      return;
    }

    // Create a new message
    const newMsg = {
      id: Date.now(),
      senderId: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('fa-IR')
    };

    // Add new message to the state
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // In a real app, this would send the message to an API
    toast.success('پیام با موفقیت ارسال شد');
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </Container>
    );
  }

  if (!seller) {
    return (
      <Container className="py-5 text-center">
        <h3>گفتگو یافت نشد</h3>
        <Button as={Link} to="/messages" className="mt-3">
          <FaArrowRight className="me-2" />
          بازگشت به پیام‌ها
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                as={Link} 
                to="/messages" 
                variant="light" 
                className="me-3"
              >
                <FaArrowRight />
              </Button>
              
              {seller.avatar ? (
                <img 
                  src={seller.avatar} 
                  alt={seller.name} 
                  className="rounded-circle me-2" 
                  width="40" 
                  height="40" 
                />
              ) : (
                <FaUserCircle size={40} className="text-secondary me-2" />
              )}
              
              <div>
                <h5 className="mb-0">{seller.name}</h5>
                <small className="text-muted">{seller.lastSeen}</small>
              </div>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body className="conversation-body" style={{ height: '400px', overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <div className="text-center text-muted my-5">
              <p>گفتگو را شروع کنید</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id} 
                className={`d-flex ${message.senderId === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-3`}
              >
                {message.senderId !== 'user' && (
                  <div className="me-2">
                    {seller.avatar ? (
                      <img 
                        src={seller.avatar} 
                        alt={seller.name} 
                        className="rounded-circle" 
                        width="30" 
                        height="30" 
                      />
                    ) : (
                      <FaUserCircle size={30} className="text-secondary" />
                    )}
                  </div>
                )}
                
                <div 
                  className={`message-bubble p-3 rounded ${
                    message.senderId === 'user' ? 'bg-primary text-white' : 'bg-light'
                  }`}
                  style={{ maxWidth: '70%' }}
                >
                  <div>{message.text}</div>
                  <small className={`d-block text-end ${message.senderId === 'user' ? 'text-white-50' : 'text-muted'}`}>
                    {message.timestamp}
                  </small>
                </div>
                
                {message.senderId === 'user' && (
                  <div className="ms-2">
                    <FaUserCircle size={30} className="text-secondary" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </Card.Body>
        
        <Card.Footer className="bg-white border-top-0">
          <Form onSubmit={handleSendMessage}>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="پیام خود را بنویسید..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs="auto" className="d-flex align-items-end">
                <Button variant="light" className="me-2" type="button">
                  <FaImage />
                </Button>
                <Button variant="primary" type="submit">
                  <FaPaperPlane />
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Conversation;
