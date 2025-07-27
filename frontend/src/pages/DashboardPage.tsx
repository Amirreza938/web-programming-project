import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Image,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  ChatIcon,
  StarIcon,
  CalendarIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiService.getUserDashboard(),
  });

  // Fetch recent products
  const { data: recentProducts } = useQuery({
    queryKey: ['recentProducts'],
    queryFn: () => apiService.getUserProducts({ page: 1, limit: 5 }),
  });

  // Fetch recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: () => apiService.getUserOrders({ page: 1, limit: 5 }),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      label: 'Total Sales',
      value: `$${dashboardData?.total_sales || 0}`,
      change: '+12%',
      icon: '💰',
      color: 'green',
    },
    {
      label: 'Active Listings',
      value: dashboardData?.active_listings || 0,
      change: '+5%',
      icon: '📦',
      color: 'blue',
    },
    {
      label: 'Total Views',
      value: dashboardData?.total_views || 0,
      change: '+8%',
      icon: '👁️',
      color: 'purple',
    },
    {
      label: 'Favorites',
      value: dashboardData?.total_favorites || 0,
      change: '+15%',
      icon: '❤️',
      color: 'red',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Listing',
      description: 'List a new item for sale',
      icon: '📝',
      color: 'brand',
      action: () => navigate('/create-product'),
    },
    {
      title: 'View Messages',
      description: 'Check your conversations',
      icon: '💬',
      color: 'blue',
      action: () => navigate('/chat'),
    },
    {
      title: 'My Orders',
      description: 'Track your purchases',
      icon: '📋',
      color: 'green',
      action: () => navigate('/orders'),
    },
    {
      title: 'Favorites',
      description: 'View saved items',
      icon: '❤️',
      color: 'red',
      action: () => navigate('/favorites'),
    },
  ];

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              Dashboard
            </Heading>
            <Text color="gray.600">
              Welcome back, {user?.first_name}! Here's what's happening with your account.
            </Text>
          </VStack>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            {stats.map((stat, index) => (
              <Card key={index} bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <VStack spacing={3} align="start">
                    <HStack spacing={3} w="full" justify="space-between">
                      <Box
                        p={2}
                        bg={`${stat.color}.100`}
                        color={`${stat.color}.600`}
                        borderRadius="full"
                        fontSize="2xl"
                      >
                        {stat.icon}
                      </Box>
                    </HStack>
                    
                    <Stat>
                      <StatNumber fontSize="2xl" fontWeight="bold">
                        {stat.value}
                      </StatNumber>
                      <StatLabel color="gray.600">{stat.label}</StatLabel>
                      <StatHelpText color="green.500">
                        <StatArrow type="increase" />
                        {stat.change} from last month
                      </StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Quick Actions */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg">
                  Quick Actions
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
                  {quickActions.map((action, index) => (
                    <Card
                      key={index}
                      cursor="pointer"
                      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      onClick={action.action}
                    >
                      <CardBody p={4}>
                        <VStack spacing={3} textAlign="center">
                          <Box
                            p={3}
                            bg={`${action.color}.100`}
                            color={`${action.color}.600`}
                            borderRadius="full"
                            fontSize="2xl"
                          >
                            {action.icon}
                          </Box>
                          <VStack spacing={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {action.title}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {action.description}
                            </Text>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Tabs for Recent Activity */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Recent Listings</Tab>
                  <Tab>Recent Orders</Tab>
                  <Tab>Analytics</Tab>
                </TabList>

                <TabPanels>
                  {/* Recent Listings */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="md">
                        Your Recent Listings
                      </Heading>
                      
                      {recentProducts?.results && recentProducts.results.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                          {recentProducts.results.map((product: any) => (
                            <Card
                              key={product.id}
                              cursor="pointer"
                              _hover={{ shadow: 'md' }}
                              onClick={() => navigate(`/products/${product.id}`)}
                            >
                              <Image
                                src={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                                alt={product.title}
                                height="150px"
                                objectFit="cover"
                              />
                              <CardBody p={4}>
                                <VStack align="start" spacing={2}>
                                  <Text fontWeight="semibold" noOfLines={2}>
                                    {product.title}
                                  </Text>
                                  <Text fontSize="lg" fontWeight="bold" color="brand.500">
                                    ${product.price}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Badge colorScheme="blue" variant="outline">
                                      {product.condition}
                                    </Badge>
                                    <Badge
                                      colorScheme={product.status === 'active' ? 'green' : 'gray'}
                                      variant="outline"
                                    >
                                      {product.status}
                                    </Badge>
                                  </HStack>
                                  <HStack spacing={2} color="gray.600">
                                    <ViewIcon />
                                    <Text fontSize="sm">{product.views_count} views</Text>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <VStack spacing={4} py={8}>
                          <Text color="gray.600">No listings yet</Text>
                          <Button
                            colorScheme="brand"
                            onClick={() => navigate('/create-product')}
                          >
                            Create Your First Listing
                          </Button>
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Recent Orders */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="md">
                        Your Recent Orders
                      </Heading>
                      
                      {recentOrders?.results && recentOrders.results.length > 0 ? (
                        <VStack spacing={4}>
                          {recentOrders.results.map((order: any) => (
                            <Card key={order.id} w="full">
                              <CardBody p={4}>
                                <HStack justify="space-between" align="start">
                                  <VStack align="start" spacing={2}>
                                    <Text fontWeight="semibold">
                                      {order.product_title}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      Order #{order.id}
                                    </Text>
                                    <HStack spacing={2}>
                                      <Badge
                                        colorScheme={
                                          order.status === 'completed' ? 'green' :
                                          order.status === 'pending' ? 'yellow' :
                                          order.status === 'cancelled' ? 'red' : 'gray'
                                        }
                                        variant="outline"
                                      >
                                        {order.status}
                                      </Badge>
                                      <Text fontSize="sm" color="gray.600">
                                        ${order.total_amount}
                                      </Text>
                                    </HStack>
                                  </VStack>
                                  
                                  <VStack align="end" spacing={1}>
                                    <Text fontSize="sm" color="gray.600">
                                      {new Date(order.created_at).toLocaleDateString()}
                                    </Text>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                      View Details
                                    </Button>
                                  </VStack>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      ) : (
                        <VStack spacing={4} py={8}>
                          <Text color="gray.600">No orders yet</Text>
                          <Button
                            colorScheme="brand"
                            onClick={() => navigate('/products')}
                          >
                            Start Shopping
                          </Button>
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Analytics */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Heading as="h3" size="md">
                        Performance Analytics
                      </Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <Heading as="h4" size="sm">
                                Monthly Sales
                              </Heading>
                              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                                ${dashboardData?.monthly_sales || 0}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                +15% from last month
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <Heading as="h4" size="sm">
                                Conversion Rate
                              </Heading>
                              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                                {dashboardData?.conversion_rate || 0}%
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Views to sales ratio
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      <Card>
                        <CardBody>
                          <VStack spacing={4} align="start">
                            <Heading as="h4" size="sm">
                              Top Performing Categories
                            </Heading>
                            <VStack spacing={2} align="start" w="full">
                              {dashboardData?.top_categories?.map((category: any, index: number) => (
                                <HStack key={index} justify="space-between" w="full">
                                  <Text>{category.name}</Text>
                                  <Text fontWeight="semibold">{category.sales} sales</Text>
                                </HStack>
                              )) || (
                                <Text color="gray.600">No data available</Text>
                              )}
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default DashboardPage; 