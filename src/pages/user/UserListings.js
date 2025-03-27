import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Card, Row, Col, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaPause, FaPlay } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { products } from '../../data/mockData';

const UserListings = () => {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Simulate API call to get user's listings
    setTimeout(() => {
      // For demo, just use the first 5 products from mock data
      setMyListings(products.slice(0, 5).map((product, index) => ({
        ...product,
        status: index < 3 ? 'active' : index === 3 ? 'pending' : 'inactive'
      })));
      setLoading(false);
    }, 1000);
  }, []);
  
  const filteredListings = myListings.filter(listing => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });
  
  const handleStatusChange = (id, newStatus) => {
    // In a real app, this would make an API call
    setMyListings(myListings.map(listing => 
      listing.id === id ? {...listing, status: newStatus} : listing
    ));
    
    toast.success(`وضعیت آگهی با موفقیت به ${newStatus === 'active' ? 'فعال' : 'غیرفعال'} تغییر کرد`);
  };
  
  const handleDelete = (id) => {
    // In a real app, this would make an API call
    if (window.confirm('آیا از حذف این آگهی اطمینان دارید؟')) {
      setMyListings(myListings.filter(listing => listing.id !== id));
      toast.success('آگهی با موفقیت حذف شد');
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">فعال</Badge>;
      case 'inactive':
        return <Badge bg="secondary">غیرفعال</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">در انتظار تایید</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>آگهی‌های من</h1>
        <Button as={Link} to="/create-listing" variant="primary">
          ثبت آگهی جدید
        </Button>
      </div>
      
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="mb-3 mb-md-0"
                >
                  <option value="all">همه آگهی‌ها</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                  <option value="pending">در انتظار تایید</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end align-items-center">
              <div>نمایش {filteredListings.length} آگهی از {myListings.length}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
        </div>
      ) : filteredListings.length === 0 ? (
        <Alert variant="info">
          آگهی‌ای یافت نشد.
          {filter !== 'all' && (
            <Button variant="link" onClick={() => setFilter('all')} className="p-0 me-2">
              نمایش همه آگهی‌ها
            </Button>
          )}
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th style={{ width: '60px' }}></th>
                <th>عنوان آگهی</th>
                <th>قیمت</th>
                <th>تاریخ ثبت</th>
                <th>بازدید</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map(listing => (
                <tr key={listing.id}>
                  <td>
                    <img
                      src={listing.image}
                      alt={listing.title}
                      width="50"
                      height="50"
                      className="rounded"
                      style={{objectFit: 'cover'}}
                    />
                  </td>
                  <td>
                    <div className="fw-bold">{listing.title}</div>
                    <div className="small text-muted">{listing.category}</div>
                  </td>
                  <td>{listing.price.toLocaleString()} تومان</td>
                  <td>{listing.date}</td>
                  <td>{listing.views}</td>
                  <td>{getStatusBadge(listing.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        as={Link} 
                        to={`/products/${listing.id}`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        as={Link} 
                        to={`/edit-listing/${listing.id}`} 
                        variant="outline-secondary" 
                        size="sm"
                      >
                        <FaEdit />
                      </Button>
                      {listing.status === 'active' ? (
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleStatusChange(listing.id, 'inactive')}
                        >
                          <FaPause />
                        </Button>
                      ) : listing.status === 'inactive' ? (
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleStatusChange(listing.id, 'active')}
                        >
                          <FaPlay />
                        </Button>
                      ) : null}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(listing.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default UserListings;
