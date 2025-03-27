import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUserCheck, FaStore, FaStar, FaCalendarAlt } from 'react-icons/fa';

const SellerInfo = ({ seller }) => {
  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
        <h5 className="mb-3">اطلاعات فروشنده</h5>
        
        <div className="d-flex align-items-center mb-3">
          <div className="bg-light p-3 rounded-circle me-3">
            <FaStore className="text-primary" size={24} />
          </div>
          <div>
            <h6 className="mb-0">{seller.name}</h6>
            <div className="d-flex align-items-center">
              <small className="text-muted me-2">
                <FaCalendarAlt className="me-1" />
                عضویت از {seller.joinDate}
              </small>
              {seller.verified && (
                <span className="badge bg-success d-flex align-items-center">
                  <FaUserCheck className="me-1" /> تأیید شده
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div className="text-warning me-1">
              <FaStar />
            </div>
            <div>
              <strong>{seller.rating}</strong>
              <span className="text-muted"> (34 نظر)</span>
            </div>
          </div>
          <span className="badge bg-info">68 آگهی فعال</span>
        </div>
        
        <Button 
          as={Link} 
          to={`/seller/${seller.id}`}
          variant="outline-secondary" 
          className="w-100 mb-2"
        >
          مشاهده همه آگهی‌های این فروشنده
        </Button>
      </Card.Body>
    </Card>
  );
};

export default SellerInfo;
