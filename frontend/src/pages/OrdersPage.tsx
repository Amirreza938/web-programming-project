import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  Person,
  Visibility,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Fetch orders data
  const { data: myOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => apiService.getMyOrders(),
  });

  const { data: mySales, isLoading: salesLoading } = useQuery({
    queryKey: ['mySales'],
    queryFn: () => apiService.getMySales(),
    enabled: user?.user_type !== 'buyer',
  });

  // Mutations
  const markShippedMutation = useMutation({
    mutationFn: async ({ orderId, trackingNumber }: { orderId: number; trackingNumber: string }) => {
      await apiService.markOrderShipped(orderId, trackingNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mySales']);
      setTrackingDialogOpen(false);
      setTrackingNumber('');
      setSelectedOrder(null);
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiService.markOrderDelivered(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mySales']);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiService.cancelOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myOrders']);
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkShipped = (order: any) => {
    setSelectedOrder(order);
    setTrackingDialogOpen(true);
  };

  const handleSubmitTracking = () => {
    if (selectedOrder && trackingNumber.trim()) {
      markShippedMutation.mutate({
        orderId: selectedOrder.id,
        trackingNumber: trackingNumber.trim(),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return <LocalShipping />;
      case 'delivered':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <ShoppingCart />;
    }
  };

  const canMarkShipped = (order: any) => {
    return order.status === 'confirmed' && user?.id === order.seller_id;
  };

  const canMarkDelivered = (order: any) => {
    return order.status === 'shipped' && user?.id === order.buyer_id;
  };

  const canCancel = (order: any) => {
    return ['pending', 'confirmed'].includes(order.status.toLowerCase()) && user?.id === order.buyer_id;
  };

  if (ordersLoading || salesLoading) {
    return <LoadingSpinner />;
  }

  const orders = tabValue === 0 ? myOrders : mySales;
  const isSalesTab = tabValue === 1;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isSalesTab ? 'My Sales' : 'My Orders'}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="My Orders" />
            {user?.user_type !== 'buyer' && <Tab label="My Sales" />}
          </Tabs>
        </Box>

        {orders && orders.length > 0 ? (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Product Image */}
                      <Grid item xs={12} sm={3}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={order.product.main_image || 'https://via.placeholder.com/200x120?text=No+Image'}
                          alt={order.product.title}
                          sx={{ borderRadius: 1 }}
                        />
                      </Grid>

                      {/* Order Details */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          {order.product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Order #{order.order_number}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Person fontSize="small" />
                          <Typography variant="body2">
                            {isSalesTab ? order.buyer_name : order.seller_name}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status) as any}
                            icon={getStatusIcon(order.status)}
                            size="small"
                          />
                          <Chip
                            label={order.payment_status}
                            color={order.payment_status === 'paid' ? 'success' : 'warning'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>

                        <Typography variant="h6" color="primary">
                          ${order.total_amount}
                        </Typography>
                      </Grid>

                      {/* Actions */}
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => window.open(`/products/${order.product.id}`, '_blank')}
                          >
                            View Product
                          </Button>

                          {canMarkShipped(order) && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<LocalShipping />}
                              onClick={() => handleMarkShipped(order)}
                            >
                              Mark Shipped
                            </Button>
                          )}

                          {canMarkDelivered(order) && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => markDeliveredMutation.mutate(order.id)}
                              disabled={markDeliveredMutation.isLoading}
                            >
                              Mark Delivered
                            </Button>
                          )}

                          {canCancel(order) && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Cancel />}
                              color="error"
                              onClick={() => cancelOrderMutation.mutate(order.id)}
                              disabled={cancelOrderMutation.isLoading}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Order Timeline */}
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Ordered on {new Date(order.created_at).toLocaleDateString()}
                      </Typography>
                      {order.shipping_method && (
                        <Typography variant="body2" color="text.secondary">
                          Shipping: {order.shipping_method}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No {isSalesTab ? 'sales' : 'orders'} yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isSalesTab 
                ? 'When you sell items, they will appear here.'
                : 'When you purchase items, they will appear here.'
              }
            </Typography>
          </Box>
        )}

        {/* Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onClose={() => setTrackingDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Mark Order as Shipped</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please provide the tracking number for order #{selectedOrder?.order_number}
            </Typography>
            <TextField
              fullWidth
              label="Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTrackingDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitTracking}
              variant="contained"
              disabled={!trackingNumber.trim() || markShippedMutation.isLoading}
            >
              {markShippedMutation.isLoading ? 'Saving...' : 'Mark Shipped'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OrdersPage; 