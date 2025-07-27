import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Image,
  Badge,
  VStack,
  HStack,
  SimpleGrid,
  useToast,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import {
  ChatIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FavoritesPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('white', 'gray.700');

  // Fetch favorites
  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiService.getFavorites(),
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (productId: number) => apiService.removeFromFavorites(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: 'Removed from favorites',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Error removing from favorites',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleRemoveFavorite = (productId: number) => {
    removeFavoriteMutation.mutate(productId);
  };

  const handleStartChat = (productId: number) => {
    // Navigate to chat with seller
    window.location.href = `/chat?product=${productId}`;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              My Favorites
            </Heading>
            <Text color="gray.600">
              Your saved items and wishlist
            </Text>
          </VStack>

          {/* Favorites Grid */}
          {favorites && favorites.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
              {favorites.map((product: any) => (
                <Card
                  key={product.id}
                  bg={cardBg}
                  shadow="md"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  <Box position="relative">
                    <Image
                      src={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={product.title}
                      height="200px"
                      objectFit="cover"
                      cursor="pointer"
                      onClick={() => window.location.href = `/products/${product.id}`}
                    />
                    
                    {/* Remove from favorites button */}
                    <IconButton
                      aria-label="Remove from favorites"
                      icon={<StarIcon />}
                      colorScheme="red"
                      variant="solid"
                      size="sm"
                      position="absolute"
                      top={2}
                      right={2}
                      onClick={() => handleRemoveFavorite(product.id)}
                      isLoading={removeFavoriteMutation.isPending}
                    />
                  </Box>

                  <CardBody p={4}>
                    <VStack align="start" spacing={3}>
                      <Text
                        fontWeight="semibold"
                        fontSize="md"
                        noOfLines={2}
                        cursor="pointer"
                        onClick={() => window.location.href = `/products/${product.id}`}
                        _hover={{ color: 'brand.500' }}
                      >
                        {product.title}
                      </Text>

                      <Text fontSize="xl" fontWeight="bold" color="brand.500">
                        ${product.price}
                      </Text>

                      {product.original_price && product.original_price > product.price && (
                        <Text fontSize="sm" color="gray.500" textDecoration="line-through">
                          ${product.original_price}
                        </Text>
                      )}

                      <HStack spacing={2}>
                        <Badge colorScheme="blue" variant="outline">
                          {product.condition}
                        </Badge>
                        {product.is_negotiable && (
                          <Badge colorScheme="green" variant="outline">
                            Negotiable
                          </Badge>
                        )}
                      </HStack>

                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {product.location}
                      </Text>

                      <Text fontSize="sm" color="gray.600">
                        by {product.seller_name}
                      </Text>

                      {/* Action Buttons */}
                      <HStack spacing={2} w="full">
                        <Button
                          size="sm"
                          colorScheme="brand"
                          flex={1}
                          onClick={() => window.location.href = `/products/${product.id}`}
                        >
                          View
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          flex={1}
                          leftIcon={<ChatIcon />}
                          onClick={() => handleStartChat(product.id)}
                        >
                          Chat
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Card bg={cardBg} shadow="md">
              <CardBody p={12}>
                <VStack spacing={6} textAlign="center">
                  <Box
                    p={4}
                    bg="red.100"
                    color="red.600"
                    borderRadius="full"
                    fontSize="2xl"
                  >
                    ❤️
                  </Box>
                  
                  <VStack spacing={2}>
                    <Heading as="h2" size="lg">
                      No favorites yet
                    </Heading>
                    <Text color="gray.600">
                      Start browsing products and add them to your favorites
                    </Text>
                  </VStack>
                  
                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={() => window.location.href = '/products'}
                  >
                    Browse Products
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default FavoritesPage; 