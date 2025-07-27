import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Favorite,
  LocationOn,
  Visibility,
  Chat,
  LocalOffer,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiService.getFavorites(),
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiService.removeFromFavorites(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
    },
  });

  const handleRemoveFavorite = (productId: number) => {
    removeFavoriteMutation.mutate(productId);
  };

  const handleStartChat = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleMakeOffer = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Favorites
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Your saved items ({favorites?.length || 0})
        </Typography>

        {favorites && favorites.length > 0 ? (
          <Grid container spacing={3}>
            {favorites.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
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
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${product.id}`)}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,1)',
                        },
                      }}
                      onClick={() => handleRemoveFavorite(product.id)}
                      disabled={removeFavoriteMutation.isLoading}
                    >
                      <Favorite color="error" />
                    </IconButton>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{ cursor: 'pointer', mb: 1 }}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.title}
                    </Typography>

                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${product.price}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {product.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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

                    <Box sx={{ mt: 'auto' }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/products/${product.id}`)}
                          sx={{ flex: 1 }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Chat />}
                          onClick={() => handleStartChat(product.id)}
                          sx={{ flex: 1 }}
                        >
                          Chat
                        </Button>
                        {product.is_negotiable && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<LocalOffer />}
                            onClick={() => handleMakeOffer(product.id)}
                            sx={{ flex: 1 }}
                          >
                            Offer
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start browsing products and save your favorites to see them here.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default FavoritesPage; 