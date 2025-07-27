import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Paper,
  Stack,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  LocalOffer,
  Security,
  Support,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch featured and popular products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => apiService.getFeaturedProducts(),
  });

  const { data: popularProducts, isLoading: popularLoading } = useQuery({
    queryKey: ['popularProducts'],
    queryFn: () => apiService.getPopularProducts(),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  const features = [
    {
      icon: <Search fontSize="large" />,
      title: 'Easy Search',
      description: 'Find exactly what you\'re looking for with our advanced search and filtering options.',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Secure Transactions',
      description: 'Safe and secure platform with verified sellers and buyer protection.',
    },
    {
      icon: <LocalOffer fontSize="large" />,
      title: 'Best Deals',
      description: 'Negotiate prices and find the best deals on quality second-hand items.',
    },
    {
      icon: <Support fontSize="large" />,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our dedicated customer support team.',
    },
  ];

  if (featuredLoading || popularLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.3)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
              }}
            >
              <Typography variant="h2" color="inherit" gutterBottom>
                Buy & Sell Second-Hand Items
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Join thousands of users buying and selling quality second-hand items in your local community.
                Save money, reduce waste, and find unique treasures.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/products')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Browse Products
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ px: 4, py: 1.5, color: 'white', borderColor: 'white' }}
                >
                  Start Selling
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Why Choose SecondHand Market?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            We provide the best platform for buying and selling second-hand items
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Products Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <Box sx={{ py: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" component="h2">
                Featured Products
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => navigate('/products')}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={3}>
              {featuredProducts.slice(0, 4).map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <Card
                    sx={{ height: '100%', cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={product.title}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
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
          </Box>
        )}

        {/* Popular Products Section */}
        {popularProducts && popularProducts.length > 0 && (
          <Box sx={{ py: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" component="h2">
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Popular Products
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => navigate('/products')}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={3}>
              {popularProducts.slice(0, 4).map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <Card
                    sx={{ height: '100%', cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={product.title}
                    />
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {product.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${product.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.location}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip
                          label={product.condition}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${product.views_count} views`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <Box sx={{ py: 8 }}>
            <Typography variant="h4" component="h2" align="center" gutterBottom>
              Browse by Category
            </Typography>
            <Grid container spacing={3}>
              {categories.slice(0, 8).map((category) => (
                <Grid item xs={6} sm={4} md={3} key={category.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      textAlign: 'center',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.2s',
                      },
                    }}
                    onClick={() => navigate(`/products?category=${category.id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.products_count} products
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Call to Action */}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Paper sx={{ p: 6, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Ready to Start Buying and Selling?
            </Typography>
            <Typography variant="h6" paragraph>
              Join our community today and discover amazing deals on quality second-hand items.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ px: 4, py: 1.5, bgcolor: 'white', color: 'primary.main' }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/products')}
                sx={{ px: 4, py: 1.5, color: 'white', borderColor: 'white' }}
              >
                Browse Now
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage; 