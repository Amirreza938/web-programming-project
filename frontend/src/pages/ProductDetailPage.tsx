import React, { useState } from 'react';
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
  Paper,
  Avatar,
  Rating,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  Visibility,
  Chat,
  LocalOffer,
  Person,
  Star,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState(0);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.getProduct(parseInt(id!)),
    enabled: !!id,
  });

  // Fetch product offers
  const { data: offers } = useQuery({
    queryKey: ['productOffers', id],
    queryFn: () => apiService.getProductOffers(parseInt(id!)),
    enabled: !!id && user?.user_type !== 'buyer',
  });

  // Mutations
  const favoriteMutation = useMutation({
    mutationFn: async ({ productId, isFavorited }: { productId: number; isFavorited: boolean }) => {
      if (isFavorited) {
        await apiService.removeFromFavorites(productId);
      } else {
        await apiService.addToFavorites(productId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
    },
  });

  const offerMutation = useMutation({
    mutationFn: async () => {
      await apiService.createOffer({
        product: parseInt(id!),
        amount: parseFloat(offerAmount),
        message: offerMessage,
      });
    },
    onSuccess: () => {
      setOfferDialogOpen(false);
      setOfferAmount('');
      setOfferMessage('');
      queryClient.invalidateQueries(['productOffers', id]);
    },
  });

  const chatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiService.createConversation(parseInt(id!), chatMessage);
      return response;
    },
    onSuccess: (data) => {
      setChatDialogOpen(false);
      setChatMessage('');
      navigate(`/chat?conversation=${data.conversation_id}`);
    },
  });

  if (isLoading || !product) {
    return <LoadingSpinner />;
  }

  const isOwner = user?.id === product.seller_id;
  const canMakeOffer = user && !isOwner && product.is_negotiable;

  const handleFavoriteToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    favoriteMutation.mutate({ productId: product.id, isFavorited: product.is_favorited });
  };

  const handleMakeOffer = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOfferDialogOpen(true);
  };

  const handleStartChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setChatDialogOpen(true);
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount || parseFloat(offerAmount) <= 0) return;
    offerMutation.mutate();
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    chatMutation.mutate();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={product.main_image || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={product.title}
                sx={{ objectFit: 'cover' }}
              />
              {/* Image Gallery */}
              {product.images && product.images.length > 1 && (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1}>
                    {product.images.map((image: string, index: number) => (
                      <Grid item key={index}>
                        <CardMedia
                          component="img"
                          height="80"
                          width="80"
                          image={image}
                          alt={`${product.title} ${index + 1}`}
                          sx={{
                            cursor: 'pointer',
                            border: selectedImage === index ? '2px solid #1976d2' : '2px solid transparent',
                          }}
                          onClick={() => setSelectedImage(index)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Title and Price */}
              <Box>
                <Typography variant="h4" gutterBottom>
                  {product.title}
                </Typography>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${product.price}
                </Typography>
                {product.original_price && product.original_price > product.price && (
                  <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ${product.original_price}
                  </Typography>
                )}
              </Box>

              {/* Condition and Location */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={product.condition}
                  color="secondary"
                  variant="outlined"
                />
                {product.is_negotiable && (
                  <Chip
                    label="Price Negotiable"
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {product.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {product.views_count} views
                  </Typography>
                </Box>
              </Box>

              {/* Seller Info */}
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {product.seller_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={product.seller_rating} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({product.seller_rating.toFixed(1)})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Chat />}
                  onClick={handleStartChat}
                  fullWidth
                >
                  Contact Seller
                </Button>
              </Paper>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                {canMakeOffer && (
                  <Button
                    variant="contained"
                    startIcon={<LocalOffer />}
                    onClick={handleMakeOffer}
                    sx={{ flex: 1 }}
                  >
                    Make Offer
                  </Button>
                )}
                <IconButton
                  onClick={handleFavoriteToggle}
                  color={product.is_favorited ? 'error' : 'default'}
                >
                  {product.is_favorited ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Stack>

              {/* Description */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </Typography>
              </Paper>

              {/* Product Details */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {product.category_name}
                    </Typography>
                  </Grid>
                  {product.brand && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Brand
                      </Typography>
                      <Typography variant="body1">
                        {product.brand}
                      </Typography>
                    </Grid>
                  )}
                  {product.model && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Model
                      </Typography>
                      <Typography variant="body1">
                        {product.model}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Listed
                    </Typography>
                    <Typography variant="body1">
                      {new Date(product.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Offers Section (for sellers) */}
        {isOwner && offers && offers.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Offers ({offers.length})
            </Typography>
            <Grid container spacing={2}>
              {offers.map((offer) => (
                <Grid item xs={12} sm={6} md={4} key={offer.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          {offer.buyer_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {offer.buyer_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(offer.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" color="primary" gutterBottom>
                        ${offer.amount}
                      </Typography>
                      {offer.message && (
                        <Typography variant="body2" color="text.secondary">
                          "{offer.message}"
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => {
                            // Handle accept offer
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            // Handle reject offer
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Offer Dialog */}
        <Dialog open={offerDialogOpen} onClose={() => setOfferDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Make an Offer</DialogTitle>
          <Box component="form" onSubmit={handleOfferSubmit}>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current price: ${product.price}
              </Typography>
              <TextField
                fullWidth
                label="Your Offer Amount ($)"
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Message (Optional)"
                multiline
                rows={3}
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Tell the seller why you're making this offer..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOfferDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!offerAmount || parseFloat(offerAmount) <= 0 || offerMutation.isLoading}
              >
                {offerMutation.isLoading ? <CircularProgress size={20} /> : 'Send Offer'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* Chat Dialog */}
        <Dialog open={chatDialogOpen} onClose={() => setChatDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Start a Conversation</DialogTitle>
          <Box component="form" onSubmit={handleChatSubmit}>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Send a message to {product.seller_name} about "{product.title}"
              </Typography>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Hi! I'm interested in your item..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChatDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!chatMessage.trim() || chatMutation.isLoading}
              >
                {chatMutation.isLoading ? <CircularProgress size={20} /> : 'Send Message'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProductDetailPage; 