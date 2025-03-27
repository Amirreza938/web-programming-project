import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaLock, FaIdCard, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Profile form
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      return setError('نام و ایمیل اجباری است');
    }
    
    try {
      setLoading(true);
      setError('');
      
      // In a real app, this would be an API call
      await updateProfile({
        name,
        email,
        phone,
        city,
        bio
      });
      
      toast.success('اطلاعات پروفایل با موفقیت به‌روزرسانی شد');
    } catch (err) {
      setError('خطا در به‌روزرسانی پروفایل');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError('همه فیلدها را پر کنید');
    }
    
    if (newPassword !== confirmPassword) {
      return setError('تکرار رمز عبور با رمز عبور جدید مطابقت ندارد');
    }
    
    if (newPassword.length < 6) {
      return setError('رمز عبور باید حداقل 6 کاراکتر باشد');
    }
    
    try {
      setLoading(true);
      setError('');
      
      // In a real app, this would verify current password and update to new password
      // For demo, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('رمز عبور با موفقیت تغییر کرد');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">تنظیمات حساب کاربری</h1>
      
      <Row>
        <Col lg={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <div className="bg-light rounded-circle p-3 mb-3" style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                    <FaUser size={60} className="text-primary" />
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="position-absolute bottom-0 end-0 rounded-circle"
                  >
                    <FaUser size={12} />
                  </Button>
                </div>
                <h5>{currentUser?.name}</h5>
                <p className="text-muted mb-0">{currentUser?.email}</p>
              </div>
              
              <hr />
              
              <div className="d-grid gap-2">
                <Button 
                  variant={activeTab === 'profile' ? 'primary' : 'light'} 
                  className="text-start"
                  onClick={() => setActiveTab('profile')}
                >
                  <FaUser className="me-2" /> اطلاعات شخصی
                </Button>
                <Button 
                  variant={activeTab === 'password' ? 'primary' : 'light'} 
                  className="text-start"
                  onClick={() => setActiveTab('password')}
                >
                  <FaLock className="me-2" /> تغییر رمز عبور
                </Button>
                <Button 
                  variant={activeTab === 'verification' ? 'primary' : 'light'} 
                  className="text-start"
                  onClick={() => setActiveTab('verification')}
                >
                  <FaIdCard className="me-2" /> احراز هویت
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9}>
          {activeTab === 'profile' && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h4 className="mb-4">اطلاعات شخصی</h4>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleProfileUpdate}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>نام و نام خانوادگی</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>ایمیل</Form.Label>
                        <Form.Control 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>شماره تماس</Form.Label>
                        <Form.Control 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>شهر</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="شهر محل سکونت"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>درباره من</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="معرفی مختصری از خودتان بنویسید"
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
          
          {activeTab === 'password' && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h4 className="mb-4">تغییر رمز عبور</h4>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handlePasswordUpdate}>
                  <Form.Group className="mb-3">
                    <Form.Label>رمز عبور فعلی</Form.Label>
                    <Form.Control 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>رمز عبور جدید</Form.Label>
                    <Form.Control 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Form.Text className="text-muted">
                      رمز عبور باید حداقل 6 کاراکتر باشد
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>تکرار رمز عبور جدید</Form.Label>
                    <Form.Control 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'در حال اعمال تغییرات...' : 'تغییر رمز عبور'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
          
          {activeTab === 'verification' && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h4 className="mb-4">احراز هویت</h4>
                
                <Alert variant={currentUser.verified ? "success" : "info"}>
                  {currentUser.verified ? 
                    'حساب کاربری شما تایید شده است.' : 
                    'برای استفاده از تمام امکانات سایت، لطفا هویت خود را تایید کنید.'}
                </Alert>
                
                {!currentUser.verified && (
                  <Form>
                    <Row className="mb-4">
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>کد ملی</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="کد ملی خود را وارد کنید"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>شماره موبایل</Form.Label>
                          <Form.Control 
                            type="tel" 
                            placeholder="شماره موبایل خود را وارد کنید"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>تصویر کارت ملی</Form.Label>
                      <Form.Control type="file" />
                      <Form.Text className="text-muted">
                        لطفا تصویر کارت ملی خود را بارگذاری کنید. فرمت‌های مجاز: JPG, PNG (حداکثر ۵ مگابایت)
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button variant="primary">
                        ارسال مدارک برای تایید هویت
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
