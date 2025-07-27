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
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, brand.500 0%, brand.600 100%)"
        color="white"
        py={20}
      >
        <Container maxW="1200px">
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
              {featuredProducts?.results?.slice(0, 4).map((product: any) => (
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
                    </VStack>
                  </CardBody>
                </Card>
              ))}
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
              {popularProducts?.results?.slice(0, 4).map((product: any) => (
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
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        bg="linear-gradient(135deg, brand.500 0%, brand.600 100%)"
        color="white"
        py={16}
      >
        <Container maxW="1200px">
          <VStack spacing={8} textAlign="center">
            <Heading as="h2" size="xl">
              Ready to Start Buying and Selling?
            </Heading>
            <Text fontSize="lg" maxW="600px">
              Join thousands of users who are already buying and selling 
              second-hand items in their community.
            </Text>
            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="brand.500"
                _hover={{ bg: 'gray.100' }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => navigate('/products')}
              >
                Browse Now
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 