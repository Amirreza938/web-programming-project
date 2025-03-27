import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup } from 'react-bootstrap';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart, FaThList, FaTh } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Mock data
import { products, categories, cities } from '../../data/mockData';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  useEffect(() => {
    // In a real app, this would be an API call with filters
    // For now, we'll filter the mock data
    setLoading(true);
    
    let results = [...products];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        product => product.title.includes(searchTerm) || product.description.includes(searchTerm)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      results = results.filter(product => product.category === selectedCategory);
    }
    
    // Apply city filter
    if (selectedCity) {
      results = results.filter(product => product.location === selectedCity);
    }
    
    // Apply price filter
    if (priceRange.min) {
      results = results.filter(product => product.price >= parseInt(priceRange.min));
    }
    
    if (priceRange.max) {
      results = results.filter(product => product.price <= parseInt(priceRange.max));
    }
    
    // Apply condition filter
    if (condition) {
      results = results.filter(product => product.condition === condition);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'priceAsc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        results.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
      default:
        // Assuming the newest are already sorted by id in descending order
        results.sort((a, b) => b.id - a.id);
        break;
    }
    
    setFilteredProducts(results);
    setLoading(false);
  }, [searchTerm, selectedCategory, selectedCity, priceRange, condition, sortBy]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL params
    setSearchParams({ search: searchTerm });
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setPriceRange({ min: '', max: '' });
    setCondition('');
    setSortBy('newest');
    setSearchParams({});
  };
  
  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
      toast.info('از علاقه‌مندی‌ها حذف شد');
    } else {
      setFavorites([...favorites, productId]);
      toast.success('به علاقه‌مندی‌ها اضافه شد');
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">آگهی‌های فروش کالای دست دوم</h1>
      
      <Row>
        {/* Filters sidebar */}
        <Col md={3} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">جستجو و فیلتر</h5>
              
              <Form onSubmit={handleSearch} className="mb-4">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="جستجو در آگهی‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
              
              <Form.Group className="mb-3">
                <Form.Label>دسته‌بندی</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>شهر</Form.Label>
                <Form.Select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">همه شهرها</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>محدوده قیمت (تومان)</Form.Label>
                <Row>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="حداقل"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="حداکثر"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </Col>
                </Row>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>وضعیت کالا</Form.Label>
                <Form.Select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="">همه</option>
                  <option value="نو">نو</option>
                  <option value="در حد نو">در حد نو</option>
                  <option value="کارکرده">کارکرده</option>
                  <option value="نیاز به تعمیر">نیاز به تعمیر</option>
                </Form.Select>
              </Form.Group>
              
              <Button variant="secondary" className="w-100" onClick={resetFilters}>
                پاک کردن فیلترها
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Products list */}
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm mb-4">
            <div>
              نمایش {filteredProducts.length} آگهی
            </div>
            <div className="d-flex align-items-center">
              <Form.Group className="d-flex align-items-center me-3">
                <Form.Label className="mb-0 me-2">مرتب‌سازی:</Form.Label>
                <Form.Select 
                  size="sm" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="newest">جدیدترین</option>
                  <option value="priceAsc">ارزان‌ترین</option>
                  <option value="priceDesc">گران‌ترین</option>
                  <option value="popular">محبوب‌ترین</option>
                </Form.Select>
              </Form.Group>
              
              <div className="btn-group">
                <Button 
                  variant={viewMode === 'grid' ? 'primary' : 'light'}
                  onClick={() => setViewMode('grid')}
                  size="sm"
                >
                  <FaTh />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'primary' : 'light'}
                  onClick={() => setViewMode('list')}
                  size="sm"
                >
                  <FaThList />
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <p className="fs-5">آگهی‌ای یافت نشد</p>
              <Button variant="primary" onClick={resetFilters}>حذف فیلترها</Button>
            </div>
          ) : (
            <Row>
              {filteredProducts.map(product => (
                <Col key={product.id} className={viewMode === 'grid' ? 'col-md-4 mb-4' : 'col-12 mb-3'}>
                  <Card className={`h-100 product-card border-0 shadow-sm ${viewMode === 'list' ? 'flex-row' : ''}`}>
                    <Link to={`/products/${product.id}`}>
                      <Card.Img 
                        variant={viewMode === 'list' ? 'start' : 'top'} 
                        src={product.image} 
                        className={viewMode === 'list' ? 'product-image w-25' : 'product-image'}
                        style={viewMode === 'list' ? { height: '150px', objectFit: 'cover' } : {}}
                      />
                    </Link>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <Badge bg={product.condition === 'نو' ? 'success' : product.condition === 'در حد نو' ? 'info' : 'warning'}>
                          {product.condition}
                        </Badge>
                        <Button 
                          variant="link" 
                          className="p-0 text-danger"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          {favorites.includes(product.id) ? <FaHeart /> : <FaRegHeart />}
                        </Button>
                      </div>
                      <Link to={`/products/${product.id}`} className="text-decoration-none">
                        <Card.Title className="text-dark">{product.title}</Card.Title>
                      </Link>
                      <Card.Text className="text-primary fw-bold">
                        {product.price.toLocaleString()} تومان
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <FaMapMarkerAlt className="me-1" />
                          {product.location}
                        </small>
                        <div>
                          <FaStar className="text-warning" />
                          <small className="ms-1">{product.rating}</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductListing;
