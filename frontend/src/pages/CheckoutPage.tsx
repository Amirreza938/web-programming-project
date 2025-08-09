import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Image,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const productId = searchParams.get('product');
  
  const [formData, setFormData] = useState({
    quantity: 1,
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_state: user?.state || '',
    shipping_country: user?.country || '',
    shipping_postal_code: user?.zip_code || '',
    phone: user?.phone || '',
    shipping_method: 1, // Default to Standard Shipping
    payment_method: 'credit_card',
    notes: ''
  });

  const cardBg = useColorModeValue('white', 'gray.700');

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiService.getProduct(parseInt(productId!)),
    enabled: !!productId,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiService.createOrder(orderData),
    onSuccess: (order) => {
      toast({
        title: 'Order placed successfully!',
        description: `Your order #${order.id} has been placed.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate(`/orders/${order.id}/tracking`);
    },
    onError: (error: any) => {
      toast({
        title: 'Order failed',
        description: error.response?.data?.message || 'Unable to place order',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    const orderData = {
      product: product.id,
      shipping_address: formData.shipping_address,
      shipping_city: formData.shipping_city,
      shipping_country: formData.shipping_country,
      shipping_postal_code: formData.shipping_postal_code,
      shipping_phone: formData.phone,
      shipping_method: formData.shipping_method,
    };

    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="800px">
          <VStack spacing={8}>
            <Text fontSize="xl" color="red.500">
              Product not found
            </Text>
            <Button onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  const totalAmount = product.price * formData.quantity;

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1000px">
        <VStack spacing={6} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              Checkout
            </Heading>
            <Text color="gray.600">
              Complete your purchase
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
              {/* Order Summary */}
              <Card bg={cardBg} shadow="md">
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading as="h3" size="md">Order Summary</Heading>
                    
                    <HStack spacing={4}>
                      <Image
                        src={product.main_image || product.images?.[0]?.image || 'https://via.placeholder.com/100'}
                        alt={product.title}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="semibold" fontSize="lg">
                          {product.title}
                        </Text>
                        <Text color="gray.600">
                          Sold by: {product.seller_name}
                        </Text>
                        <Badge colorScheme="green" size="lg">
                          {product.condition}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <Text>Price per item:</Text>
                      <Text fontWeight="semibold">${product.price}</Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Quantity:</Text>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                        w="80px"
                        size="sm"
                      />
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Shipping:</Text>
                      <Text>Free</Text>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between" fontSize="xl" fontWeight="bold">
                      <Text>Total:</Text>
                      <Text color="green.500">${totalAmount}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Shipping & Payment */}
              <VStack spacing={6} align="stretch">
                {/* Shipping Information */}
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="md">Shipping Information</Heading>
                      
                      <FormControl isRequired>
                        <FormLabel>Address</FormLabel>
                        <Input
                          value={formData.shipping_address}
                          onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                          placeholder="Street address"
                        />
                      </FormControl>

                      <SimpleGrid columns={2} gap={4}>
                        <FormControl isRequired>
                          <FormLabel>City</FormLabel>
                          <Input
                            value={formData.shipping_city}
                            onChange={(e) => handleInputChange('shipping_city', e.target.value)}
                            placeholder="City"
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>State/Province</FormLabel>
                          <Input
                            value={formData.shipping_state}
                            onChange={(e) => handleInputChange('shipping_state', e.target.value)}
                            placeholder="State"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={2} gap={4}>
                        <FormControl isRequired>
                          <FormLabel>Postal Code</FormLabel>
                          <Input
                            value={formData.shipping_postal_code}
                            onChange={(e) => handleInputChange('shipping_postal_code', e.target.value)}
                            placeholder="Postal code"
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Country</FormLabel>
                          <Input
                            value={formData.shipping_country}
                            onChange={(e) => handleInputChange('shipping_country', e.target.value)}
                            placeholder="Country"
                          />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Phone number"
                          />
                        </FormControl>
                      </SimpleGrid>

                      {/* Shipping Method */}
                      <FormControl isRequired>
                        <FormLabel>Shipping Method</FormLabel>
                        <Select
                          value={formData.shipping_method}
                          onChange={(e) => handleInputChange('shipping_method', parseInt(e.target.value))}
                        >
                          <option value={1}>Standard Shipping</option>
                          <option value={2}>Express Shipping</option>
                          <option value={3}>Overnight Shipping</option>
                          <option value={4}>Local Pickup</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Payment Information */}
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="md">Payment Method</Heading>
                      
                      <FormControl>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          value={formData.payment_method}
                          onChange={(e) => handleInputChange('payment_method', e.target.value)}
                        >
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="paypal">PayPal</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cash_on_delivery">Cash on Delivery</option>
                        </Select>
                      </FormControl>

                      <Alert status="info">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Payment processing is simulated for this demo. No real payment will be charged.
                        </Text>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Order Notes */}
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="md">Order Notes (Optional)</Heading>
                      
                      <FormControl>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Special instructions or notes for the seller..."
                          rows={3}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Action Buttons */}
                <HStack spacing={4}>
                  <Button
                    variant="outline"
                    flex={1}
                    onClick={() => navigate(`/products/${productId}`)}
                  >
                    Back to Product
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="green"
                    flex={2}
                    size="lg"
                    isLoading={createOrderMutation.isPending}
                    loadingText="Placing Order..."
                  >
                    Place Order - ${totalAmount}
                  </Button>
                </HStack>
              </VStack>
            </SimpleGrid>
          </form>
        </VStack>
      </Container>
    </Box>
  );
};

export default CheckoutPage;
