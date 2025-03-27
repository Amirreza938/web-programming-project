import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Badge, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaTrash, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

// Mock conversation data
const mockConversations = [
  {
    id: 'seller123',
    name: 'علی محمدی',
    lastMessage: 'سلام، محصول هنوز موجود هست؟',
    timestamp: '10:25',
    date: '1401/08/12',
    unread: 2,
    avatar: null
  },
  {
    id: 'seller456',
    name: 'سارا احمدی',
    lastMessage: 'بله، امکان ارسال به شهرستان هم داریم',
    timestamp: 'دیروز',
    date: '1401/08/11',
    unread: 0,
    avatar: null
  },
  {
    id: 'seller789',
    name: 'رضا کریمی',
    lastMessage: 'قیمت نهایی چقدر هست؟',
    timestamp: '1401/08/05',
    date: '1401/08/05',
    unread: 0,
    avatar: null
  }
];

const UserMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    // Fetch user conversations
    const fetchConversations = () => {
      setLoading(true);
      // Simulating API call with timeout
      setTimeout(() => {
        setConversations(mockConversations);
        setLoading(false);
      }, 800);
    };

    fetchConversations();
  }, []);

  const deleteConversation = (conversationId) => {
    // In a real application, this would make an API call to delete the conversation
    setConversations(conversations.filter(conv => conv.id !== conversationId));
    toast.info('گفتگو با موفقیت حذف شد');
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">پیام‌های من</h2>
      
      <Form className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="جستجو در پیام‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline-secondary">
            <FaSearch />
          </Button>
        </InputGroup>
      </Form>

      {filteredConversations.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaEnvelope size={40} className="d-block mx-auto mb-3" />
          {searchQuery ? 'نتیجه‌ای یافت نشد' : 'شما هیچ پیامی ندارید'}
          {!searchQuery && (
            <div className="mt-3">
              <Button as={Link} to="/products" variant="primary">مشاهده محصولات</Button>
            </div>
          )}
        </Alert>
      ) : (
        <ListGroup>
          {filteredConversations.map(conversation => (
            <ListGroup.Item 
              key={conversation.id}
              className="d-flex justify-content-between align-items-center border p-3 mb-2"
            >
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {conversation.avatar ? (
                    <img 
                      src={conversation.avatar} 
                      alt={conversation.name} 
                      className="rounded-circle" 
                      width="50" 
                      height="50" 
                    />
                  ) : (
                    <FaUserCircle size={50} className="text-secondary" />
                  )}
                </div>
                <div>
                  <Link 
                    to={`/messages/${conversation.id}`} 
                    className="text-decoration-none"
                  >
                    <h5 className="mb-1">{conversation.name}</h5>
                  </Link>
                  <p className="mb-1 text-muted small">{conversation.lastMessage}</p>
                  <small className="text-muted">{conversation.date}</small>
                </div>
              </div>
              <div className="d-flex align-items-center">
                {conversation.unread > 0 && (
                  <Badge bg="primary" pill className="me-3">
                    {conversation.unread}
                  </Badge>
                )}
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => deleteConversation(conversation.id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default UserMessages;
