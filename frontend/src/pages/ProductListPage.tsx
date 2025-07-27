import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Pagination,
  Paper,
  InputAdornment,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Favorite,
  FavoriteBorder,
  LocationOn,
  Visibility,
  Sort,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [priceRange, setPriceRange] = useState<number[]>([
    parseInt(searchParams.get('min_price') || '0'),
    parseInt(searchParams.get('max_price') || '10000'),
  ]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  // Fetch products with filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', searchQuery, category, condition, priceRange, sortBy, page],
    queryFn: () => apiService.getProducts({
      search: searchQuery,
      category: category || undefined,
      condition: condition || undefined,
      min_price: priceRange[0],
      max_price: priceRange[1],
      ordering: sortBy,
      page,
    }),
    keepPreviousData: true,
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < 10000) params.set('max_price', priceRange[1].toString());
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [searchQuery, category, condition, priceRange, sortBy, page, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handlePriceRangeChangeCommitted = () => {
    handleFilterChange();
  };

  const handleFavoriteToggle = async (productId: number, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        await apiService.removeFromFavorites(productId);
      } else {
        await apiService.addToFavorites(productId);
      }
      // Refetch products to update favorite status
      window.location.reload();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setCondition('');
    setPriceRange([0, 10000]);
    setSortBy('newest');
    setPage(1);
  };

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_repair', label: 'Needs Repair' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'most_viewed', label: 'Most Viewed' },
  ];

  const FilterDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 300,
          p: 3,
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <FilterContent />
    </Drawer>
  );

  const FilterContent = () => (
    <Stack spacing={3}>
      {/* Category Filter */}
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => {
            setCategory(e.target.value);
            handleFilterChange();
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Condition Filter */}
      <FormControl fullWidth>
        <InputLabel>Condition</InputLabel>
        <Select
          value={condition}
          label="Condition"
          onChange={(e) => {
            setCondition(e.target.value);
            handleFilterChange();
          }}
        >
          <MenuItem value="">All Conditions</MenuItem>
          {conditionOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Range Filter */}
      <Box>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceRangeChange}
          onChangeCommitted={handlePriceRangeChangeCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            size="small"
            label="Min"
            type="number"
            value={priceRange[0]}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              setPriceRange([value, priceRange[1]]);
            }}
            onBlur={handleFilterChange}
          />
          <TextField
            size="small"
            label="Max"
            type="number"
            value={priceRange[1]}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 10000;
              setPriceRange([priceRange[0], value]);
            }}
            onBlur={handleFilterChange}
          />
        </Box>
      </Box>

      <Button variant="outlined" onClick={clearFilters}>
        Clear Filters
      </Button>
    </Stack>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Browse Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {productsData?.count || 0} products found
          </Typography>
        </Box>

        {/* Search and Sort Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={6}>
              <Box component="form" onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>

            {/* Sort */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    handleFilterChange();
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filter Button */}
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setDrawerOpen(true)}
                fullWidth
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Desktop Filters */}
        {!isMobile && (
          <Grid container spacing={3}>
            <Grid item md={3}>
              <Paper sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom>
                  Filters
                </Typography>
                <FilterContent />
              </Paper>
            </Grid>

            {/* Products Grid */}
            <Grid item md={9}>
              <Grid container spacing={3}>
                {productsData?.results?.map((product) => (
                  <Grid item xs={12} sm={6} lg={4} key={product.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          transition: 'transform 0.2s',
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={product.title}
                          onClick={() => navigate(`/products/${product.id}`)}
                        />
                        {user && (
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(255,255,255,0.8)',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(product.id, product.is_favorited);
                            }}
                          >
                            {product.is_favorited ? (
                              <Favorite color="error" />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          noWrap
                          onClick={() => navigate(`/products/${product.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {product.title}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                          ${product.price}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            {product.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Visibility fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            {product.views_count} views
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={product.condition}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                          {product.is_negotiable && (
                            <Chip
                              label="Negotiable"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {productsData && productsData.count > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={Math.ceil(productsData.count / 12)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <>
            <Grid container spacing={2}>
              {productsData?.results?.map((product) => (
                <Grid item xs={12} sm={6} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.title}
                        onClick={() => navigate(`/products/${product.id}`)}
                      />
                      {user && (
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255,255,255,0.8)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(product.id, product.is_favorited);
                          }}
                        >
                          {product.is_favorited ? (
                            <Favorite color="error" />
                          ) : (
                            <FavoriteBorder />
                          )}
                        </IconButton>
                      )}
                    </Box>
                    <CardContent>
                      <Typography
                        variant="h6"
                        noWrap
                        onClick={() => navigate(`/products/${product.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {product.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                        ${product.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.location}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={product.condition}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Mobile Pagination */}
            {productsData && productsData.count > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(productsData.count / 12)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="small"
                />
              </Box>
            )}
          </>
        )}

        {/* Mobile Filter Drawer */}
        <FilterDrawer />
      </Box>
    </Container>
  );
};

export default ProductListPage; 