import React, { useState } from 'react';
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
  Flex,
  VStack,
  HStack,
  Divider,
  Textarea,
  Input,
  useToast,
  Spinner,
  Center,
  SimpleGrid,
  Avatar,
  IconButton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  StarIcon,
  ViewIcon,
  ChatIcon,
  CalendarIcon,
} from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  // State
  const [selectedImage, setSelectedImage] = useState(0);
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiService.getProduct(parseInt(id!)),
    enabled: !!id,
  });

  // Mutations
  const favoriteMutation = useMutation({
    mutationFn: (productId: number) => apiService.toggleFavorite(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast({
        title: 'Success',
        description: 'Product added to favorites!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update favorites.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const offerMutation = useMutation({
    mutationFn: (data: { productId: number; amount: number }) => 
      apiService.createOffer(data.productId, { amount: data.amount, message }),
    onSuccess: () => {
      setOfferAmount('');
      onClose();
      toast({
        title: 'Offer sent!',
        description: 'Your offer has been sent to the seller.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send offer.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: (productId: number) => apiService.createConversation(productId),
    onSuccess: (data: any) => {
      // The backend returns { conversation_id: number } or the full conversation object
      const conversationId = data.conversation_id || data.id;
      navigate(`/chat?conversation=${conversationId}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start conversation.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    favoriteMutation.mutate(parseInt(id!));
  };

  const handleOffer = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid offer amount.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    offerMutation.mutate({ productId: parseInt(id!), amount: parseFloat(offerAmount) });
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    chatMutation.mutate(parseInt(id!));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !product) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">
            Product not found
          </Text>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </VStack>
      </Center>
    );
  }

  const isOwner = user?.id === product.seller;

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          {/* Product Images and Details */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
            {/* Product Images */}
            <VStack spacing={4}>
              <Box position="relative" w="full">
                <Image
                  src={product.images?.[selectedImage]?.image || product.main_image || 'https://via.placeholder.com/500x400?text=No+Image'}
                  alt={product.title}
                  w="full"
                  h="400px"
                  objectFit="cover"
                  borderRadius="lg"
                />
                {product.images && product.images.length > 1 && (
                  <HStack spacing={2} mt={4} justify="center">
                    {product.images.map((img: any, index: number) => (
                      <Image
                        key={index}
                        src={img.image}
                        alt={`${product.title} ${index + 1}`}
                        w="80px"
                        h="80px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                        border={selectedImage === index ? '2px solid' : '1px solid'}
                        borderColor={selectedImage === index ? 'brand.500' : 'gray.200'}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </HStack>
                )}
              </Box>
            </VStack>

            {/* Product Information */}
            <VStack spacing={6} align="stretch">
              <VStack align="start" spacing={4}>
                <Heading as="h1" size="xl">
                  {product.title}
                </Heading>
                
                <HStack spacing={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                    ${product.price}
                  </Text>
                  {product.original_price && product.original_price > product.price && (
                    <Text fontSize="lg" color="gray.500" textDecoration="line-through">
                      ${product.original_price}
                    </Text>
                  )}
                </HStack>

                <HStack spacing={3}>
                  <Badge colorScheme="blue" variant="outline" size="lg">
                    {product.condition}
                  </Badge>
                  {product.is_negotiable && (
                    <Badge colorScheme="green" variant="outline" size="lg">
                      Negotiable
                    </Badge>
                  )}
                  {product.is_featured && (
                    <Badge colorScheme="purple" variant="outline" size="lg">
                      Featured
                    </Badge>
                  )}
                </HStack>

                <Text fontSize="lg" color="gray.700">
                  {product.description}
                </Text>

                <VStack align="start" spacing={2}>
                  <HStack spacing={2} color="gray.600">
                    <ViewIcon />
                    <Text>{product.views_count} views</Text>
                  </HStack>
                  <HStack spacing={2} color="gray.600">
                    <CalendarIcon />
                    <Text>Listed {new Date(product.created_at).toLocaleDateString()}</Text>
                  </HStack>
                </VStack>
              </VStack>

              <Divider />

              {/* Seller Information */}
              <VStack align="start" spacing={4}>
                <Heading as="h3" size="md">
                  Seller Information
                </Heading>
                <HStack spacing={4}>
                  <Avatar
                    size="md"
                    name={product.seller_name}
                    src={product.seller_image}
                  />
                  <VStack align="start" spacing={1}>
                    <Text 
                      fontWeight="semibold"
                      color="blue.500"
                      cursor="pointer"
                      _hover={{ textDecoration: 'underline' }}
                      onClick={() => navigate(`/user/${product.seller}`)}
                    >
                      {product.seller_name}
                    </Text>
                    <HStack spacing={2}>
                      <StarIcon color="yellow.400" />
                      <Text fontSize="sm" color="gray.600">
                        {product.seller_rating || 'No ratings'} ({product.seller_ratings_count || 0} reviews)
                      </Text>
                    </HStack>
                    {product.seller_verified && (
                      <Badge colorScheme="green" size="sm">
                        Verified Seller
                      </Badge>
                    )}
                  </VStack>
                </HStack>
              </VStack>

              <Divider />

              {/* Action Buttons */}
              {!isOwner && (
                <VStack spacing={4}>
                  {product.status === 'sold' ? (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">This product has been sold</Text>
                        <Text fontSize="sm">This item is no longer available for purchase.</Text>
                      </VStack>
                    </Alert>
                  ) : product.status === 'inactive' ? (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">Currently Unavailable</Text>
                        <Text fontSize="sm">This product is temporarily unavailable.</Text>
                      </VStack>
                    </Alert>
                  ) : (
                    <>
                      <HStack spacing={4} w="full">
                        <Button
                          colorScheme="green"
                          size="lg"
                          flex={1}
                          onClick={() => navigate(`/checkout?product=${id}`)}
                        >
                          Buy Now - ${product.price}
                        </Button>
                        <IconButton
                          size="lg"
                          aria-label="Add to favorites"
                          icon={<StarIcon />}
                          colorScheme={product.is_favorited ? 'red' : 'gray'}
                          variant={product.is_favorited ? 'solid' : 'outline'}
                          onClick={handleFavorite}
                          isLoading={favoriteMutation.isPending}
                        />
                      </HStack>
                    </>
                  )}
                  
                  <HStack spacing={4} w="full">
                    <Button
                      colorScheme="brand"
                      size="md"
                      flex={1}
                      onClick={handleChat}
                      leftIcon={<ChatIcon />}
                      isLoading={chatMutation.isPending}
                    >
                      Chat with Seller
                    </Button>
                    
                    {product.is_negotiable && (
                      <Button
                        variant="outline"
                        size="md"
                        flex={1}
                        onClick={onOpen}
                      >
                        Make an Offer
                      </Button>
                    )}
                  </HStack>
                </VStack>
              )}

              {isOwner && (
                <VStack spacing={4}>
                  <Text color="gray.600" textAlign="center">
                    This is your listing
                  </Text>
                  <HStack spacing={4} w="full">
                    <Button
                      colorScheme="brand"
                      variant="outline"
                      flex={1}
                      onClick={() => navigate(`/products/${id}/edit`)}
                    >
                      Edit Listing
                    </Button>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      flex={1}
                    >
                      Delete Listing
                    </Button>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </SimpleGrid>

          {/* Additional Information */}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            {/* Shipping Information */}
            <Card bg={cardBg}>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading as="h3" size="md">
                    Shipping & Payment
                  </Heading>
                  <VStack align="start" spacing={2}>
                    <Text><strong>Shipping:</strong> {product.shipping_method || 'Not specified'}</Text>
                    <Text><strong>Payment:</strong> {product.payment_method || 'Not specified'}</Text>
                    <Text><strong>Returns:</strong> {product.return_policy || 'Not specified'}</Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Product Specifications */}
            <Card bg={cardBg}>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading as="h3" size="md">
                    Specifications
                  </Heading>
                  <VStack align="start" spacing={2}>
                    <Text><strong>Category:</strong> {product.category_name}</Text>
                    <Text><strong>Brand:</strong> {product.brand || 'Not specified'}</Text>
                    <Text><strong>Model:</strong> {product.model || 'Not specified'}</Text>
                    <Text><strong>Year:</strong> {product.year || 'Not specified'}</Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* Offer Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Make an Offer</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Text>
                  Current price: <strong>${product.price}</strong>
                </Text>
                <Input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Enter your offer"
                  min="0"
                  step="0.01"
                />
                <Textarea
                  placeholder="Add a message to your offer (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                <HStack spacing={4} w="full">
                  <Button onClick={onClose} variant="outline" flex={1}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="brand"
                    onClick={handleOffer}
                    flex={1}
                    isLoading={offerMutation.isPending}
                  >
                    Send Offer
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;