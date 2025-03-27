import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaTrash, FaPlus, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { categories, cities } from '../../data/mockData';

const CreateListing = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('');
  const [images, setImages] = useState([]);
  const [contactInfo, setContactInfo] = useState('');
  
  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files) {
      if (images.length + e.target.files.length > 5) {
        toast.error('حداکثر 5 تصویر می‌توانید آپلود کنید');
        return;
      }
      
      const newImages = [...images];
      Array.from(e.target.files).forEach(file => {
        // In real app, you would upload to server and get URLs
        // For now, create object URLs
        const imageUrl = URL.createObjectURL(file);
        newImages.push({ file, url: imageUrl });
      });
      setImages(newImages);
    }
  };
  
  // Remove image
  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    if (images.length === 0) {
      setError('لطفا حداقل یک تصویر آپلود کنید');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // In a real app, this would send data to the server
    setTimeout(() => {
      toast.success('آگهی شما با موفقیت ثبت شد و پس از تایید منتشر خواهد شد');
      setLoading(false);
      navigate('/my-listings');
    }, 1500);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">ثبت آگهی جدید</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-4">اطلاعات کالا</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>عنوان آگهی *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={70}
                  />
                  <Form.Control.Feedback type="invalid">
                    لطفا عنوان آگهی را وارد کنید
                  </Form.Control.Feedback>
                  <Form.Text>حداکثر 70 کاراکتر</Form.Text>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>دسته‌بندی *</Form.Label>
                      <Form.Select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">انتخاب دسته‌بندی</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        لطفا دسته‌بندی را انتخاب کنید
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>وضعیت کالا *</Form.Label>
                      <Form.Select 
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        required
                      >
                        <option value="">انتخاب وضعیت</option>
                        <option value="نو">نو</option>
                        <option value="در حد نو">در حد نو</option>
                        <option value="کارکرده">کارکرده</option>
                        <option value="نیاز به تعمیر">نیاز به تعمیر</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        لطفا وضعیت کالا را انتخاب کنید
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>توضیحات *</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5} 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    لطفا توضیحات آگهی را وارد کنید
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>قیمت (تومان) *</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="number" 
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          min="1000"
                        />
                        <InputGroup.Text>تومان</InputGroup.Text>
                      </InputGroup>
                      <Form.Control.Feedback type="invalid">
                        لطفا قیمت معتبر وارد کنید
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3 mt-md-4">
                      <Form.Check 
                        type="checkbox"
                        label="قابل مذاکره"
                        checked={negotiable}
                        onChange={(e) => setNegotiable(e.target.checked)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>شهر *</Form.Label>
                  <Form.Select 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  >
                    <option value="">انتخاب شهر</option>
                    {cities.map(cityName => (
                      <option key={cityName} value={cityName}>{cityName}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    لطفا شهر را انتخاب کنید
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>اطلاعات تماس</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="در صورت تمایل شماره تماس یا روش ارتباطی دیگر را وارد کنید"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-4">تصاویر</h5>
                
                <div className="mb-3">
                  <p>
                    <FaInfoCircle className="text-primary me-2" />
                    حداکثر 5 تصویر می‌توانید آپلود کنید. تصویر اول به عنوان تصویر اصلی آگهی نمایش داده می‌شود.
                  </p>
                </div>
                
                <div className="d-flex flex-wrap gap-3 mb-4">
                  {images.map((image, index) => (
                    <div 
                      key={index} 
                      className="position-relative border rounded" 
                      style={{ width: '120px', height: '120px' }}
                    >
                      <img 
                        src={image.url} 
                        alt={`Product ${index + 1}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 rounded-circle p-1"
                        onClick={() => removeImage(index)}
                      >
                        <FaTrash size={12} />
                      </Button>
                      {index === 0 && (
                        <span className="position-absolute bottom-0 start-0 bg-primary text-white px-2 py-1 small">
                          تصویر اصلی
                        </span>
                      )}
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <div>
                      <input
                        type="file"
                        id="image-upload"
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="image-upload"
                        className="d-flex flex-column align-items-center justify-content-center border border-dashed rounded"
                        style={{ width: '120px', height: '120px', cursor: 'pointer' }}
                      >
                        <FaPlus className="mb-2" />
                        <span>افزودن تصویر</span>
                      </label>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
              <Card.Body>
                <h5 className="mb-3">خلاصه آگهی</h5>
                
                <div className="mb-3 pb-3 border-bottom">
                  <div className="text-muted mb-1">عنوان:</div>
                  <strong>{title || '(عنوان وارد نشده)'}</strong>
                </div>
                
                <div className="mb-3 pb-3 border-bottom">
                  <div className="text-muted mb-1">دسته‌بندی:</div>
                  <strong>{category || '(انتخاب نشده)'}</strong>
                </div>
                
                <div className="mb-3 pb-3 border-bottom">
                  <div className="text-muted mb-1">قیمت:</div>
                  <strong>
                    {price ? `${Number(price).toLocaleString()} تومان` : '(قیمت وارد نشده)'}
                    {negotiable && price && ' (قابل مذاکره)'}
                  </strong>
                </div>
                
                <div className="mb-4">
                  <div className="text-muted mb-1">موقعیت:</div>
                  <strong>{city || '(انتخاب نشده)'}</strong>
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'در حال ثبت آگهی...' : 'ثبت آگهی'}
                </Button>
                
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    با ثبت آگهی، شما <a href="/terms" target="_blank">قوانین و مقررات</a> سایت را می‌پذیرید.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default CreateListing;
