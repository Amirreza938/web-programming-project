import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Nav, Tab, Button, Alert } from 'react-bootstrap';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaShoppingCart, FaList, FaExclamationTriangle, 
  FaChartLine, FaCheckCircle, FaTimesCircle, FaClock, FaSearch,
  FaEdit, FaTrashAlt, FaEye
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

// Mock data import - replace with API calls in production
import { products } from '../../data/mockData';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Mock statistics data
  const [stats, setStats] = useState({
    totalUsers: 134,
    activeListings: 562,
    pendingApprovals: 12,
    reportedItems: 5,
    totalSales: '2,450,000',
    recentUsers: 7,
    completedOrders: 24,
    pendingOrders: 8
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // Fetch dashboard data
    const fetchData = () => {
      setLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        // In a real app, this would be an API call to fetch admin statistics
        setLoading(false);
      }, 800);
    };

    fetchData();
  }, [isAdmin, navigate]);

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
    <Container fluid className="py-4">
      <Row>
        <Col lg={3} md={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-4">پنل مدیریت</h5>
              <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                  <Nav.Link eventKey="overview" className="mb-2">
                    <FaChartLine className="me-2" /> داشبورد
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="users" className="mb-2">
                    <FaUsers className="me-2" /> کاربران
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="listings" className="mb-2">
                    <FaList className="me-2" /> آگهی‌ها
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders" className="mb-2">
                    <FaShoppingCart className="me-2" /> سفارشات
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reports" className="mb-2">
                    <FaExclamationTriangle className="me-2" /> گزارشات تخلف
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9} md={12}>
          <Tab.Content>
            {/* Overview Tab */}
            <Tab.Pane eventKey="overview" active={activeTab === 'overview'}>
              <h3 className="mb-4">داشبورد مدیریت</h3>
              
              <Row>
                <Col md={3} sm={6} className="mb-4">
                  <Card className="text-white bg-primary shadow-sm border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">کاربران</h6>
                          <h2 className="mt-2 mb-0">{stats.totalUsers}</h2>
                        </div>
                        <FaUsers size={40} opacity={0.4} />
                      </div>
                      <small>{stats.recentUsers} کاربر جدید امروز</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={3} sm={6} className="mb-4">
                  <Card className="text-white bg-success shadow-sm border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">آگهی‌های فعال</h6>
                          <h2 className="mt-2 mb-0">{stats.activeListings}</h2>
                        </div>
                        <FaList size={40} opacity={0.4} />
                      </div>
                      <small>{stats.pendingApprovals} آگهی در انتظار تایید</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={3} sm={6} className="mb-4">
                  <Card className="text-white bg-info shadow-sm border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">سفارشات</h6>
                          <h2 className="mt-2 mb-0">{stats.completedOrders + stats.pendingOrders}</h2>
                        </div>
                        <FaShoppingCart size={40} opacity={0.4} />
                      </div>
                      <small>{stats.pendingOrders} سفارش در انتظار ارسال</small>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={3} sm={6} className="mb-4">
                  <Card className="text-white bg-danger shadow-sm border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">گزارشات</h6>
                          <h2 className="mt-2 mb-0">{stats.reportedItems}</h2>
                        </div>
                        <FaExclamationTriangle size={40} opacity={0.4} />
                      </div>
                      <small>نیاز به بررسی</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Row>
                <Col lg={8} className="mb-4">
                  <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">آخرین آگهی‌ها</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>عنوان</th>
                            <th>قیمت</th>
                            <th>وضعیت</th>
                            <th>عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.slice(0, 5).map(product => (
                            <tr key={product.id}>
                              <td>{product.title}</td>
                              <td>{product.price.toLocaleString()} تومان</td>
                              <td>
                                <Badge bg={product.active ? 'success' : 'warning'}>
                                  {product.active ? 'فعال' : 'در انتظار تایید'}
                                </Badge>
                              </td>
                              <td>
                                <Button variant="outline-primary" size="sm" className="me-1">
                                  <FaEye />
                                </Button>
                                <Button variant="outline-danger" size="sm">
                                  <FaTimesCircle />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={4}>
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">کاربران جدید</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <FaUsers className="text-primary me-3" size={30} />
                        <div>
                          <h6 className="mb-0">رضا حسینی</h6>
                          <small className="text-muted">ثبت‌نام: امروز</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <FaUsers className="text-primary me-3" size={30} />
                        <div>
                          <h6 className="mb-0">مریم علوی</h6>
                          <small className="text-muted">ثبت‌نام: دیروز</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaUsers className="text-primary me-3" size={30} />
                        <div>
                          <h6 className="mb-0">علی کریمی</h6>
                          <small className="text-muted">ثبت‌نام: 2 روز پیش</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">گزارشات اخیر</h5>
                    </Card.Header>
                    <Card.Body>
                      <Alert variant="danger">
                        <strong>گزارش تخلف:</strong> آگهی با محتوای نامناسب
                      </Alert>
                      <Alert variant="danger">
                        <strong>گزارش تخلف:</strong> قیمت نامتعارف محصول
                      </Alert>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>
            
            {/* Users Tab */}
            <Tab.Pane eventKey="users" active={activeTab === 'users'}>
              <h3 className="mb-4">مدیریت کاربران</h3>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-4">
                    <div className="d-flex">
                      <Button variant="outline-primary" className="me-2">همه کاربران</Button>
                      <Button variant="outline-success" className="me-2">کاربران فعال</Button>
                      <Button variant="outline-danger">کاربران مسدود شده</Button>
                    </div>
                    <div>
                      <Button variant="primary">
                        <FaSearch className="me-2" />
                        جستجو
                      </Button>
                    </div>
                  </div>
                  
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>نام کاربر</th>
                        <th>ایمیل</th>
                        <th>تاریخ ثبت‌نام</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>علی محمدی</td>
                        <td>ali@example.com</td>
                        <td>1401/05/12</td>
                        <td>
                          <Badge bg="success">فعال</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                          <Button variant="outline-warning" size="sm" className="me-1">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTimesCircle />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>سارا احمدی</td>
                        <td>sara@example.com</td>
                        <td>1401/06/23</td>
                        <td>
                          <Badge bg="success">فعال</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                          <Button variant="outline-warning" size="sm" className="me-1">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTimesCircle />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>رضا کریمی</td>
                        <td>reza@example.com</td>
                        <td>1401/07/05</td>
                        <td>
                          <Badge bg="danger">مسدود شده</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                          <Button variant="outline-warning" size="sm" className="me-1">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-success" size="sm">
                            <FaCheckCircle />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            {/* Products Tab */}
            <Tab.Pane eventKey="listings" active={activeTab === 'listings'}>
              <h3 className="mb-4">مدیریت آگهی‌ها</h3>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-4">
                    <div className="d-flex">
                      <Button variant="outline-primary" className="me-2">همه آگهی‌ها</Button>
                      <Button variant="outline-warning" className="me-2">در انتظار تایید</Button>
                      <Button variant="outline-danger">گزارش شده</Button>
                    </div>
                    <div>
                      <Button variant="primary">
                        <FaSearch className="me-2" />
                        جستجو
                      </Button>
                    </div>
                  </div>
                  
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>عنوان</th>
                        <th>قیمت</th>
                        <th>فروشنده</th>
                        <th>تاریخ ثبت</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product, index) => (
                        <tr key={product.id}>
                          <td>{index + 1}</td>
                          <td>{product.title}</td>
                          <td>{product.price.toLocaleString()} تومان</td>
                          <td>{product.sellerName || 'علی محمدی'}</td>
                          <td>{product.date || '1401/08/01'}</td>
                          <td>
                            <Badge bg={product.active ? 'success' : 'warning'}>
                              {product.active ? 'فعال' : 'در انتظار تایید'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-info" size="sm" className="me-1">
                              <FaEye />
                            </Button>
                            <Button variant="outline-success" size="sm" className="me-1">
                              <FaCheckCircle />
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              <FaTrashAlt />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            {/* Orders Tab */}
            <Tab.Pane eventKey="orders" active={activeTab === 'orders'}>
              <h3 className="mb-4">مدیریت سفارشات</h3>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-4">
                    <div className="d-flex">
                      <Button variant="outline-primary" className="me-2">همه سفارشات</Button>
                      <Button variant="outline-warning" className="me-2">در حال پردازش</Button>
                      <Button variant="outline-success" className="me-2">تکمیل شده</Button>
                      <Button variant="outline-danger">لغو شده</Button>
                    </div>
                    <div>
                      <Button variant="primary">
                        <FaSearch className="me-2" />
                        جستجو
                      </Button>
                    </div>
                  </div>
                  
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>شماره سفارش</th>
                        <th>خریدار</th>
                        <th>محصول</th>
                        <th>مبلغ</th>
                        <th>تاریخ</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>#ORD-12345</td>
                        <td>محمد رضایی</td>
                        <td>گوشی موبایل سامسونگ</td>
                        <td>8,500,000 تومان</td>
                        <td>1401/08/10</td>
                        <td>
                          <Badge bg="warning">در حال پردازش</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                          <Button variant="outline-success" size="sm">
                            <FaCheckCircle />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>#ORD-12344</td>
                        <td>سارا محمدی</td>
                        <td>لپ تاپ لنوو</td>
                        <td>12,800,000 تومان</td>
                        <td>1401/08/09</td>
                        <td>
                          <Badge bg="success">تکمیل شده</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>#ORD-12343</td>
                        <td>علی کریمی</td>
                        <td>هدفون بلوتوثی</td>
                        <td>850,000 تومان</td>
                        <td>1401/08/08</td>
                        <td>
                          <Badge bg="danger">لغو شده</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            {/* Reports Tab */}
            <Tab.Pane eventKey="reports" active={activeTab === 'reports'}>
              <h3 className="mb-4">گزارشات تخلف</h3>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>آگهی</th>
                        <th>گزارش دهنده</th>
                        <th>دلیل</th>
                        <th>تاریخ</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>گوشی آیفون 13 پرو</td>
                        <td>رضا محمدی</td>
                        <td>محتوای نامناسب</td>
                        <td>1401/08/10</td>
                        <td>
                          <Badge bg="warning">در حال بررسی</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                          <Button variant="outline-success" size="sm" className="me-1">
                            <FaCheckCircle />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrashAlt />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>لپ تاپ گیمینگ ایسوس</td>
                        <td>مریم علوی</td>
                        <td>قیمت نامتعارف</td>
                        <td>1401/08/09</td>
                        <td>
                          <Badge bg="warning">در حال بررسی</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                          <Button variant="outline-success" size="sm" className="me-1">
                            <FaCheckCircle />
                          </Button>
                          <Button variant="outline-danger" size="sm">
                            <FaTrashAlt />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>دوچرخه کوهستان</td>
                        <td>علی احمدی</td>
                        <td>کلاهبرداری</td>
                        <td>1401/08/08</td>
                        <td>
                          <Badge bg="success">رسیدگی شده</Badge>
                        </td>
                        <td>
                          <Button variant="outline-info" size="sm" className="me-1">
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
