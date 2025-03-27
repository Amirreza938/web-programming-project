import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Card, Form, Tab, Tabs, ListGroup, Alert, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUserCircle, FaStar, FaShareAlt, FaFlag, FaClock, FaTruck, FaHandshake, FaBox } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import ImageGallery from '../../components/product/ImageGallery';
import SimilarProducts from '../../components/product/SimilarProducts';
import SellerInfo from '../../components/product/SellerInfo';

// Mock data
import { products } from '../../data/mockData';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('');

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use mock data
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Simulating API call
        setTimeout(() => {
          const foundProduct = products.find(p => p.id.toString() === id);
          
          if (!foundProduct) {
            navigate('/not-found');
            return;
          }
          
          setProduct(foundProduct);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("خطا در بارگذاری محصول. لطفا مجددا تلاش کنید.");
        setLoading(false);
      }
    };
    
    fetchProduct();
    
    // Check if product is in favorites
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(storedFavorites.includes(id));
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const toggleFavorite = () => {
    if (!currentUser) {
      toast.info('برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب کاربری شوید');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = storedFavorites.filter(item => item !== id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast.info('از علاقه‌مندی‌ها حذف شد');
    } else {
      localStorage.setItem('favorites', JSON.stringify([...storedFavorites, id]));
      setIsFavorite(true);
      toast.success('به علاقه‌مندی‌ها اضافه شد');
    }
  };

  const handleContactSeller = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.info('برای تماس با فروشنده ابتدا وارد حساب کاربری شوید');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    if (message.trim() === '') {
      toast.error('لطفا پیام خود را وارد کنید');
      return;
    }
    
    // In a real app, this would send a message to the seller
    toast.success('پیام شما با موفقیت ارسال شد');
    setMessage('');
    
    // Navigate to messages with this seller
    navigate('/messages/seller123');
  };
  
  const handleMakeOffer = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.info('برای ارسال پیشنهاد قیمت ابتدا وارد حساب کاربری شوید');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    if (!offerPrice || offerPrice <= 0) {
      toast.error('لطفا قیمت پیشنهادی معتبر وارد کنید');
      return;
    }
    
    // In a real app, this would send an offer to the seller
    toast.success('پیشنهاد قیمت شما با موفقیت ثبت شد');
    setOfferPrice('');
  };
  
  const handleShowContact = () => {
    if (!currentUser) {
      toast.info('برای مشاهده اطلاعات تماس ابتدا وارد حساب کاربری شوید');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    setShowContactInfo(true);
  };
  
  const handleReportItem = () => {
    if (!currentUser) {
      toast.info('برای گزارش آگهی ابتدا وارد حساب کاربری شوید');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    // In a real app, this would open a report modal
    toast.info('گزارش شما ثبت شد. با تشکر از همکاری شما');
  };
  
  const handlePurchase = () => {
    if (!currentUser) {
      toast.info('برای خرید ابتدا وارد حساب کاربری شوید');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    if (!selectedShipping) {
      toast.error('لطفا روش ارسال را انتخاب کنید');
      return;
    }
    
    // In a real app, this would proceed to checkout
    toast.success('به مرحله نهایی خرید منتقل می‌شوید');
    navigate('/checkout', { state: { product, shippingMethod: selectedShipping } });
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
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center">
          <Button as={Link} to="/products" variant="primary">
            بازگشت به لیست محصولات
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">خانه</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products">محصولات</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>
      
      <Row>
        {/* Product Images and Details */}
        <Col lg={8} className="mb-4">
          <div className="product-detail-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-3 mb-0">{product.title}</h1>
              <div>
                <Button variant="light" className="me-2" onClick={toggleFavorite}>
                  {isFavorite ? <FaHeart className="text-danger" /> : <FaRegHeart />}
                </Button>
                <Button variant="light" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.info('لینک آگهی کپی شد');
                }}>
                  <FaShareAlt />
                </Button>
              </div>
            </div>
            
            {/* Product Gallery */}
            <ImageGallery images={[product.image, ...Array(4).fill('https://via.placeholder.com/600x400')]} />
            
            <div className="border-bottom my-4"></div>
            
            {/* Product Info */}
            <Row className="mb-4">
              <Col md={6}>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">دسته‌بندی:</span>
                    <span className="fw-bold">{product.category}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">وضعیت:</span>
                    <Badge bg={product.condition === 'نو' ? 'success' : product.condition === 'در حد نو' ? 'info' : 'warning'}>
                      {product.condition}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">موقعیت:</span>
                    <span>
                      <FaMapMarkerAlt className="me-1 text-danger" />
                      {product.location}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">تاریخ ثبت:</span>
                    <span>{product.date}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">بازدید:</span>
                    <span>{product.views} نفر</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="text-muted">شناسه آگهی:</span>
                    <span className="text-muted">{product.id}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>
            
            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              <Tab eventKey="description" title="توضیحات">
                <Card.Body>
                  <h5 className="mb-3">توضیحات محصول</h5>
                  <p>{product.description || 'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.'}</p>
                  
                  <h5 className="mt-4 mb-3">ویژگی‌های محصول</h5>
                  <Row>
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <span className="fw-bold me-2">برند:</span>
                          <span>سامسونگ</span>
                        </li>
                        <li className="mb-2">
                          <span className="fw-bold me-2">مدل:</span>
                          <span>Galaxy S21</span>
                        </li>
                        <li className="mb-2">
                          <span className="fw-bold me-2">سال تولید:</span>
                          <span>2021</span>
                        </li>
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <span className="fw-bold me-2">رنگ:</span>
                          <span>مشکی</span>
                        </li>
                        <li className="mb-2">
                          <span className="fw-bold me-2">گارانتی:</span>
                          <span>6 ماه</span>
                        </li>
                        <li className="mb-2">
                          <span className="fw-bold me-2">حافظه:</span>
                          <span>128 گیگابایت</span>
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </Card.Body>
              </Tab>
              <Tab eventKey="shipping" title="روش‌های ارسال">
                <Card.Body>
                  <h5 className="mb-3">روش‌های ارسال و تحویل</h5>
                  
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="radio"
                        id="shipping-post"
                        label={
                          <div className="d-flex align-items-center">
                            <FaTruck className="me-2 text-success" />
                            <div>
                              <div>پست پیشتاز (2-4 روز کاری)</div>
                              <div className="text-muted small">هزینه: 35,000 تومان</div>
                            </div>
                          </div>
                        }
                        name="shippingMethod"
                        value="post"
                        checked={selectedShipping === 'post'}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="mb-3"
                      />
                      
                      <Form.Check
                        type="radio"
                        id="shipping-courier"
                        label={
                          <div className="d-flex align-items-center">
                            <FaTruck className="me-2 text-danger" />
                            <div>
                              <div>پیک (ارسال سریع در همان روز)</div>
                              <div className="text-muted small">هزینه: 55,000 تومان</div>
                            </div>
                          </div>
                        }
                        name="shippingMethod"
                        value="courier"
                        checked={selectedShipping === 'courier'}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="mb-3"
                      />
                      
                      <Form.Check
                        type="radio"
                        id="shipping-inperson"
                        label={
                          <div className="d-flex align-items-center">
                            <FaHandshake className="me-2 text-primary" />
                            <div>
                              <div>تحویل حضوری</div>
                              <div className="text-muted small">توافق برای محل و زمان تحویل</div>
                            </div>
                          </div>
                        }
                        name="shippingMethod"
                        value="inperson"
                        checked={selectedShipping === 'inperson'}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                      />
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Tab>
              <Tab eventKey="comments" title="نظرات">
                <Card.Body>
                  <div className="d-flex align-items-start border-bottom pb-4 mb-4">
                    <FaUserCircle size={40} className="text-secondary me-3" />
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 me-2">امیر حسینی</h6>
                        <div className="text-warning">
                          <FaStar size={14} />
                          <FaStar size={14} />
                          <FaStar size={14} />
                          <FaStar size={14} />
                          <FaStar size={14} />
                        </div>
                      </div>
                      <div className="text-muted small mb-2">2 هفته پیش</div>
                      <p>محصول خوبی بود و از خریدم راضی هستم. فروشنده هم برخورد خوبی داشت و محصول خیلی زود به دستم رسید.</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <FaUserCircle size={40} className="text-secondary me-3" />
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 me-2">مریم رضایی</h6>
                        <div className="text-warning">
                          <FaStar size={14} />
                          <FaStar size={14} />
                          <FaStar size={14} />
                          <FaStar size={14} />
                        </div>
                      </div>
                      <div className="text-muted small mb-2">1 ماه پیش</div>
                      <p>کیفیت محصول خوب بود و مطابق با توضیحات آگهی. فقط کمی دیر به دستم رسید.</p>
                    </div>
                  </div>
                  
                  {currentUser ? (
                    <div className="mt-4 pt-4 border-top">
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>امتیاز شما</Form.Label>
                          <div className="d-flex fs-4 text-warning">
                            <FaStar role="button" className="me-1" />
                            <FaStar role="button" className="me-1" />
                            <FaStar role="button" className="me-1" />
                            <FaStar role="button" className="me-1" />
                            <FaStar role="button" className="me-1" />
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>نظر شما</Form.Label>
                          <Form.Control as="textarea" rows={3} placeholder="نظر خود را درباره این محصول بنویسید..." />
                        </Form.Group>
                        <Button variant="primary">ثبت نظر</Button>
                      </Form>
                    </div>
                  ) : (
                    <Alert variant="info" className="mt-4">
                      برای ثبت نظر ابتدا <Link to="/login">وارد</Link> شوید
                    </Alert>
                  )}
                </Card.Body>
              </Tab>
            </Tabs>
          </div>
        </Col>
        
        {/* Sidebar with Price and Seller Info */}
        <Col lg={4}>
          {/* Price and CTA */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">قیمت</div>
                <h3 className="text-primary mb-0">{product.price.toLocaleString()} تومان</h3>
              </div>
              
              <div className="d-flex align-items-center mb-4">
                <FaClock className="text-muted me-2" />
                <small>
                  {product.negotiable ? 
                    'قیمت قابل مذاکره است' : 
                    'قیمت مقطوع است'}
                </small>
              </div>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 mb-3"
                onClick={handlePurchase}
              >
                <FaBox className="me-2" /> خرید محصول
              </Button>
              
              <Button 
                variant="outline-primary" 
                className="w-100"
                onClick={handleShowContact}
              >
                {showContactInfo ? (
                  <span>
                    <FaPhoneAlt className="me-2" /> 09123456789
                  </span>
                ) : (
                  <span>
                    <FaPhoneAlt className="me-2" /> مشاهده شماره تماس
                  </span>
                )}
              </Button>
              
              <hr className="my-4" />
              
              {/* Make Offer */}
              <h6 className="mb-3">پیشنهاد قیمت</h6>
              <Form onSubmit={handleMakeOffer}>
                <InputGroup className="mb-3">
                  <Form.Control 
                    type="number" 
                    placeholder="قیمت پیشنهادی شما"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                  />
                  <InputGroup.Text>تومان</InputGroup.Text>
                </InputGroup>
                <Button 
                  type="submit" 
                  variant="outline-success" 
                  className="w-100"
                >
                  ارسال پیشنهاد
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Seller Info */}
          <SellerInfo 
            seller={{
              id: 'seller123',
              name: product.sellerName || 'علی محمدی',
              joinDate: '1401/04/12',
              rating: 4.8,
              verified: true
            }} 
          />
          
          {/* Contact Form */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">پیام به فروشنده</h5>
              <Form onSubmit={handleContactSeller}>
                <Form.Group className="mb-3">
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="پیام خود را بنویسید..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="w-100">
                  <FaEnvelope className="me-2" />
                  ارسال پیام
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="d-grid">
            <Button 
              variant="outline-danger" 
              size="sm"
              className="d-flex align-items-center justify-content-center"
              onClick={handleReportItem}
            >
              <FaFlag className="me-2" />
              گزارش آگهی مشکل‌دار
            </Button>
          </div>
        </Col>
      </Row>
      
      {/* Similar Products */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>محصولات مشابه</h3>
          <Link to={`/products?category=${product.category}`} className="btn btn-link">
            مشاهده بیشتر
          </Link>
        </div>
        <SimilarProducts category={product.category} currentProductId={product.id} />
      </div>
    </Container>
  );
};

export default ProductDetails;
