import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Image,
  Badge,
  Flex,
  Stack,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import {
  SearchIcon,
  ChatIcon,
  StarIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  // Add floating animation styles
  const floatingAnimation = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1) opacity(0.6); }
      50% { transform: scale(1.1) opacity(1); }
    }
  `;

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
      icon: SearchIcon,
      title: 'Easy Search',
      description: 'Find exactly what you need with our advanced search and filtering system.',
    },
    {
      icon: ChatIcon,
      title: 'Direct Communication',
      description: 'Chat directly with sellers to negotiate prices and ask questions.',
    },
    {
      icon: StarIcon,
      title: 'Verified Sellers',
      description: 'Buy from trusted, verified sellers with ratings and reviews.',
    },
    {
      icon: ArrowForwardIcon,
      title: 'Secure Transactions',
      description: 'Safe and secure payment processing with buyer and seller protection.',
    },
  ];

  if (featuredLoading || popularLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <style>{floatingAnimation}</style>
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        position="relative"
        color="white"
        py={20}
        minH="500px"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          right: '-50%',
          bottom: '-50%',
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: 1,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 1,
        }}
      >
        <Container maxW="1200px" position="relative" zIndex={2}>
          {/* Floating geometric shapes */}
          <Box
            position="absolute"
            top="10%"
            right="10%"
            w="100px"
            h="100px"
            borderRadius="50%"
            bg="rgba(255, 255, 255, 0.1)"
            backdropFilter="blur(10px)"
            animation="float 6s ease-in-out infinite"
            zIndex={1}
          />
          <Box
            position="absolute"
            bottom="20%"
            left="5%"
            w="60px"
            h="60px"
            borderRadius="20px"
            bg="rgba(255, 255, 255, 0.08)"
            backdropFilter="blur(10px)"
            animation="float 8s ease-in-out infinite reverse"
            zIndex={1}
          />
          <Box
            position="absolute"
            top="60%"
            right="20%"
            w="80px"
            h="80px"
            borderRadius="50%"
            bg="rgba(255, 255, 255, 0.06)"
            backdropFilter="blur(10px)"
            animation="float 7s ease-in-out infinite"
            zIndex={1}
          />
          
          <VStack spacing={8} textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="bold">
              Buy and Sell Second-Hand Items
            </Heading>
            <Text fontSize="xl" maxW="600px">
              Connect with local buyers and sellers. Find great deals on quality items 
              or sell your unused belongings for cash.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="brand.500"
                _hover={{ bg: 'gray.100' }}
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/create-product')}
              >
                Sell Your Items
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={16} bg="gray.50">
        <Container maxW="1200px">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading as="h2" size="xl">
                Why Choose SecondHand?
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="600px">
                Our platform makes buying and selling second-hand items simple, 
                secure, and enjoyable.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={8}>
              {features.map((feature, index) => (
                <VStack key={index} spacing={4} textAlign="center">
                  <Box
                    p={4}
                    bg="brand.500"
                    color="white"
                    borderRadius="full"
                    fontSize="2xl"
                  >
                    <Icon as={feature.icon} />
                  </Box>
                  <VStack spacing={2}>
                    <Heading as="h3" size="md">
                      {feature.title}
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      {feature.description}
                    </Text>
                  </VStack>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box py={16}>
        <Container maxW="1200px">
          <VStack spacing={8}>
            <Flex justify="space-between" align="center" w="full">
              <Heading as="h2" size="xl">
                Featured Products
              </Heading>
              <Button
                rightIcon={<ArrowForwardIcon />}
                variant="ghost"
                colorScheme="brand"
                onClick={() => navigate('/products?featured=true')}
              >
                View All
              </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
              {(featuredProducts?.results || (Array.isArray(featuredProducts) ? featuredProducts : []) || []).slice(0, 4).map((product: any) => (
                <Card
                  key={product.id}
                  bg={cardBg}
                  shadow="md"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <Image
                    src={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={product.title}
                    height="200px"
                    objectFit="cover"
                  />
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Heading as="h3" size="md" noOfLines={2}>
                        {product.title}
                      </Heading>
                      <Text fontSize="xl" fontWeight="bold" color="brand.500">
                        ${product.price}
                      </Text>
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
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {product.location}
                      </Text>
                      <HStack spacing={1} align="center">
                        <Icon as={StarIcon} boxSize={3} color="yellow.400" />
                        <Text fontSize="sm" color="gray.600">
                          {product.seller_rating && Number(product.seller_rating) > 0 
                            ? Number(product.seller_rating).toFixed(1) 
                            : 'New'} 
                          <Text 
                            as="span" 
                            color="blue.500" 
                            cursor="pointer"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${product.seller_id || product.seller}`);
                            }}
                          >
                            ({product.seller_name})
                          </Text>
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
              {(!featuredProducts?.results && !Array.isArray(featuredProducts)) && (
                <Text textAlign="center" color="gray.500" gridColumn="1 / -1">
                  No featured products available at the moment.
                </Text>
              )}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Popular Categories */}
      <Box py={16} bg="gray.50">
        <Container maxW="1200px">
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading as="h2" size="xl">
                Popular Categories
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Explore items by category
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={6}>
              {categories?.slice(0, 8).map((category: any) => (
                <Card
                  key={category.id}
                  bg={cardBg}
                  shadow="md"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => navigate(`/products?category=${category.id}`)}
                >
                  <CardBody textAlign="center">
                    <VStack spacing={3}>
                      <Text fontSize="lg" fontWeight="semibold">
                        {category.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {category.product_count || 0} items
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Popular Products */}
      <Box py={16}>
        <Container maxW="1200px">
          <VStack spacing={8}>
            <Flex justify="space-between" align="center" w="full">
              <Heading as="h2" size="xl">
                Most Popular
              </Heading>
              <Button
                rightIcon={<ArrowForwardIcon />}
                variant="ghost"
                colorScheme="brand"
                onClick={() => navigate('/products?sort=popular')}
              >
                View All
              </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
              {(popularProducts?.results || (Array.isArray(popularProducts) ? popularProducts : []) || []).slice(0, 4).map((product: any) => (
                <Card
                  key={product.id}
                  bg={cardBg}
                  shadow="md"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <Image
                    src={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={product.title}
                    height="200px"
                    objectFit="cover"
                  />
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Heading as="h3" size="md" noOfLines={2}>
                        {product.title}
                      </Heading>
                      <Text fontSize="xl" fontWeight="bold" color="brand.500">
                        ${product.price}
                      </Text>
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
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {product.location}
                      </Text>
                      <HStack spacing={1} align="center">
                        <Icon as={StarIcon} boxSize={3} color="yellow.400" />
                        <Text fontSize="sm" color="gray.600">
                          {product.seller_rating && Number(product.seller_rating) > 0 
                            ? Number(product.seller_rating).toFixed(1) 
                            : 'New'} 
                          <Text 
                            as="span" 
                            color="blue.500" 
                            cursor="pointer"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${product.seller_id || product.seller}`);
                            }}
                          >
                            ({product.seller_name})
                          </Text>
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
              {(!popularProducts?.results && !Array.isArray(popularProducts)) && (
                <Text textAlign="center" color="gray.500" gridColumn="1 / -1">
                  No popular products available at the moment.
                </Text>
              )}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={20}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: 1,
        }}
      >
        <Container maxW="1200px" position="relative" zIndex={2}>
          <VStack spacing={12} textAlign="center">
            {/* Main CTA Content */}
            <VStack spacing={6}>
              <Heading as="h2" size="2xl" fontWeight="bold">
                Ready to Start Buying and Selling?
              </Heading>
              <Text fontSize="xl" maxW="700px" opacity={0.9}>
                Join thousands of users who are already buying and selling 
                second-hand items in their community. Start your journey today!
              </Text>
            </VStack>

            {/* Statistics Section */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} w="full" maxW="800px">
              <VStack spacing={2}>
                <Text fontSize="4xl" fontWeight="bold" color="yellow.300">
                  10K+
                </Text>
                <Text fontSize="lg" opacity={0.9}>
                  Active Users
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="4xl" fontWeight="bold" color="green.300">
                  50K+
                </Text>
                <Text fontSize="lg" opacity={0.9}>
                  Items Sold
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="4xl" fontWeight="bold" color="blue.300">
                  99%
                </Text>
                <Text fontSize="lg" opacity={0.9}>
                  Satisfaction Rate
                </Text>
              </VStack>
            </SimpleGrid>

            {/* Action Buttons */}
            <VStack spacing={6}>
              <HStack spacing={6} flexWrap="wrap" justify="center">
                <Button
                  size="lg"
                  bg="white"
                  color="brand.500"
                  px={8}
                  py={4}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                  onClick={() => navigate('/register')}
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  borderWidth={2}
                  color="white"
                  px={8}
                  py={4}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)' }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                  onClick={() => navigate('/products')}
                >
                  Browse Products
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  color="white"
                  px={8}
                  py={4}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{ bg: 'whiteAlpha.100', transform: 'translateY(-2px)' }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                  onClick={() => navigate('/create-product')}
                >
                  Sell Your Items
                </Button>
              </HStack>
              
              {/* Trust Indicators */}
              <HStack spacing={8} opacity={0.8} fontSize="sm">
                <HStack spacing={2}>
                  <Box w={2} h={2} bg="green.400" borderRadius="full" />
                  <Text>Secure Transactions</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box w={2} h={2} bg="blue.400" borderRadius="full" />
                  <Text>Verified Sellers</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box w={2} h={2} bg="yellow.400" borderRadius="full" />
                  <Text>24/7 Support</Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 