import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Favorite,
  Chat,
  Add,
  Visibility,
  Star,
  LocalOffer,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: userDashboard, isLoading: userDashboardLoading } = useQuery({
    queryKey: ['userDashboard'],
    queryFn: () => apiService.getUserDashboard(),
    enabled: !!user,
  });

  const { data: sellerDashboard, isLoading: sellerDashboardLoading } = useQuery({
    queryKey: ['sellerDashboard'],
    queryFn: () => apiService.getSellerDashboard(),
    enabled: !!user && user.user_type !== 'buyer',
  });

  // Fetch recent data
  const { data: recentOrders } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: () => apiService.getMyOrders(),
    enabled: !!user,
  });

  const { data: recentProducts } = useQuery({
    queryKey: ['recentProducts'],
    queryFn: () => apiService.getProducts({ seller: user?.id }),
    enabled: !!user && user.user_type !== 'buyer',
  });

  if (userDashboardLoading || sellerDashboardLoading) {
    return <LoadingSpinner />;
  }

  const dashboardData = userDashboard || {};
  const sellerData = sellerDashboard || {};

  const quickActions = [
    {
      title: 'Create Listing',
      description: 'List a new item for sale',
      icon: <Add />,
      action: () => navigate('/create-product'),
      color: 'primary',
      show: user?.user_type !== 'buyer',
    },
    {
      title: 'Browse Products',
      description: 'Find items to buy',
      icon: <Visibility />,
      action: () => navigate('/products'),
      color: 'secondary',
      show: true,
    },
    {
      title: 'My Orders',
      description: 'View your orders',
      icon: <ShoppingCart />,
      action: () => navigate('/orders'),
      color: 'success',
      show: true,
    },
    {
      title: 'Messages',
      description: 'Check your conversations',
      icon: <Chat />,
      action: () => navigate('/chat'),
      color: 'info',
      show: true,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.first_name}! Here's what's happening with your account.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ShoppingCart />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {dashboardData.total_orders || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <Favorite />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="secondary">
                      {dashboardData.favorites_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Favorites
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <Star />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {user?.average_rating.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <Chat />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="info.main">
                      {dashboardData.unread_messages || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unread Messages
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Seller Statistics (if applicable) */}
        {user?.user_type !== 'buyer' && sellerData && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Seller Statistics
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <Add />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="warning.main">
                        {sellerData.active_listings || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Listings
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                      <LocalOffer />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="error.main">
                        {sellerData.pending_offers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Offers
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="success.main">
                        ${sellerData.total_sales || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Sales
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <Visibility />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" color="info.main">
                        {sellerData.total_views || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Views
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
          </Grid>
          {quickActions.filter(action => action.show).map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s',
                  },
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: `${action.color}.main`,
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Orders
                </Typography>
                <Button size="small" onClick={() => navigate('/orders')}>
                  View All
                </Button>
              </Box>
              {recentOrders && recentOrders.length > 0 ? (
                <List>
                  {recentOrders.slice(0, 5).map((order, index) => (
                    <React.Fragment key={order.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <ShoppingCart />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={order.product.title}
                          secondary={`$${order.total_amount} • ${order.status}`}
                        />
                        <Chip
                          label={order.status}
                          size="small"
                          color={order.status === 'completed' ? 'success' : 'default'}
                        />
                      </ListItem>
                      {index < recentOrders.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No recent orders
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Recent Products (for sellers) */}
          {user?.user_type !== 'buyer' && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Listings
                  </Typography>
                  <Button size="small" onClick={() => navigate('/create-product')}>
                    Create New
                  </Button>
                </Box>
                {recentProducts && recentProducts.results && recentProducts.results.length > 0 ? (
                  <List>
                    {recentProducts.results.slice(0, 5).map((product, index) => (
                      <React.Fragment key={product.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <Visibility />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={product.title}
                            secondary={`$${product.price} • ${product.views_count} views`}
                          />
                          <Chip
                            label={product.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={product.is_active ? 'success' : 'default'}
                          />
                        </ListItem>
                        {index < recentProducts.results.slice(0, 5).length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No listings yet
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}

          {/* Account Status */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Status
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  label={user?.user_type}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={user?.verification_status === 'verified' ? 'Verified' : 'Not Verified'}
                  color={user?.verification_status === 'verified' ? 'success' : 'warning'}
                  icon={user?.verification_status === 'verified' ? <Star /> : undefined}
                />
                {user?.is_premium && (
                  <Chip
                    label="Premium"
                    color="secondary"
                  />
                )}
                <Chip
                  label={`${user?.total_ratings} reviews`}
                  variant="outlined"
                />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage; 