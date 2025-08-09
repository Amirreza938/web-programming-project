import React, { useState } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Divider,
} from '@chakra-ui/react';
import {
  SearchIcon,
  ViewIcon,
  WarningIcon,
  CheckCircleIcon,
  EmailIcon,
} from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboardPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.600');

  // Fetch admin statistics
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats', selectedPeriod],
    queryFn: () => apiService.getAdminStats(selectedPeriod),
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ['adminActivities'],
    queryFn: () => apiService.getAdminActivities(),
  });

  // Fetch system health
  const { data: systemHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => apiService.getSystemHealth(),
  });

  if (statsLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      label: 'Total Users',
      value: adminStats?.total_users || 0,
      change: adminStats?.users_growth || 0,
      icon: '👥',
      color: 'blue',
    },
    {
      label: 'Active Listings',
      value: adminStats?.active_listings || 0,
      change: adminStats?.listings_growth || 0,
      icon: '📦',
      color: 'green',
    },
    {
      label: 'Total Orders',
      value: adminStats?.total_orders || 0,
      change: adminStats?.orders_growth || 0,
      icon: '🛒',
      color: 'purple',
    },
    {
      label: 'Revenue',
      value: `$${adminStats?.total_revenue || 0}`,
      change: adminStats?.revenue_growth || 0,
      icon: '💰',
      color: 'green',
    },
    {
      label: 'Disputes',
      value: adminStats?.open_disputes || 0,
      change: adminStats?.disputes_change || 0,
      icon: '⚠️',
      color: 'orange',
    },
    {
      label: 'Pending Verifications',
      value: adminStats?.pending_verifications || 0,
      change: adminStats?.verifications_change || 0,
      icon: '🔍',
      color: 'yellow',
    },
  ];

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1400px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              Admin Dashboard
            </Heading>
            <HStack spacing={4}>
              <Text color="gray.600">
                System Overview and Management
              </Text>
              <Select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                width="200px"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </Select>
            </HStack>
          </VStack>

          {/* System Health */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h3" size="md">
                  System Health
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                  <VStack>
                    <Text fontWeight="semibold">Server Status</Text>
                    <Badge colorScheme="green" size="lg">
                      {systemHealth?.server_status || 'Online'}
                    </Badge>
                  </VStack>
                  <VStack>
                    <Text fontWeight="semibold">Database</Text>
                    <Badge colorScheme="green" size="lg">
                      {systemHealth?.database_status || 'Connected'}
                    </Badge>
                  </VStack>
                  <VStack>
                    <Text fontWeight="semibold">Storage</Text>
                    <VStack spacing={1}>
                      <Progress 
                        value={systemHealth?.storage_usage || 45} 
                        colorScheme="blue" 
                        width="100px"
                      />
                      <Text fontSize="sm">{systemHealth?.storage_usage || 45}% used</Text>
                    </VStack>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {stats.map((stat, index) => (
              <Card key={index} bg={statBg} shadow="md">
                <CardBody>
                  <Stat>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <StatLabel fontSize="sm" color="gray.600">
                          {stat.label}
                        </StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="bold">
                          {stat.value}
                        </StatNumber>
                        <StatHelpText mb={0}>
                          <StatArrow type={stat.change >= 0 ? 'increase' : 'decrease'} />
                          {Math.abs(stat.change)}%
                        </StatHelpText>
                      </VStack>
                      <Text fontSize="3xl">{stat.icon}</Text>
                    </HStack>
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Detailed Analytics Tabs */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Users</Tab>
                  <Tab>Products</Tab>
                  <Tab>Orders</Tab>
                  <Tab>Disputes</Tab>
                  <Tab>System Logs</Tab>
                </TabList>

                <TabPanels>
                  {/* Users Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Heading as="h4" size="md">User Management</Heading>
                        <InputGroup maxW="300px">
                          <InputLeftElement>
                            <SearchIcon color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>
                      </HStack>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <Heading as="h5" size="sm">Recent Registrations</Heading>
                              <VStack spacing={2} align="stretch" w="full">
                                {recentActivities?.recent_users?.map((user: any) => (
                                  <HStack key={user.id} justify="space-between">
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="semibold">{user.username}</Text>
                                      <Text fontSize="sm" color="gray.600">{user.email}</Text>
                                    </VStack>
                                    <Badge colorScheme={user.is_verified ? 'green' : 'yellow'}>
                                      {user.is_verified ? 'Verified' : 'Pending'}
                                    </Badge>
                                  </HStack>
                                )) || (
                                  <Text color="gray.600">No recent registrations</Text>
                                )}
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <Heading as="h5" size="sm">User Statistics</Heading>
                              <SimpleGrid columns={2} gap={4} w="full">
                                <Stat>
                                  <StatLabel>Buyers</StatLabel>
                                  <StatNumber>{adminStats?.buyers_count || 0}</StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel>Sellers</StatLabel>
                                  <StatNumber>{adminStats?.sellers_count || 0}</StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel>Verified</StatLabel>
                                  <StatNumber>{adminStats?.verified_users || 0}</StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel>Premium</StatLabel>
                                  <StatNumber>{adminStats?.premium_users || 0}</StatNumber>
                                </Stat>
                              </SimpleGrid>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* Products Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h4" size="md">Product Analytics</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <Heading as="h5" size="sm">Category Performance</Heading>
                              <VStack spacing={2} align="stretch" w="full">
                                {adminStats?.top_categories?.map((category: any, index: number) => (
                                  <HStack key={index} justify="space-between">
                                    <Text>{category.name}</Text>
                                    <Badge colorScheme="blue">
                                      {category.count} products
                                    </Badge>
                                  </HStack>
                                )) || (
                                  <Text color="gray.600">No data available</Text>
                                )}
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <Heading as="h5" size="sm">Product Health</Heading>
                              <VStack spacing={2} align="stretch" w="full">
                                <HStack justify="space-between">
                                  <Text>Products needing review</Text>
                                  <Badge colorScheme="orange">
                                    {adminStats?.products_pending_review || 0}
                                  </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Expired listings</Text>
                                  <Badge colorScheme="red">
                                    {adminStats?.expired_listings || 0}
                                  </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text>Featured products</Text>
                                  <Badge colorScheme="purple">
                                    {adminStats?.featured_products || 0}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* Orders Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h4" size="md">Order Management</Heading>
                      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                        <Stat>
                          <StatLabel>Pending Orders</StatLabel>
                          <StatNumber color="orange.500">
                            {adminStats?.pending_orders || 0}
                          </StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Shipped Orders</StatLabel>
                          <StatNumber color="blue.500">
                            {adminStats?.shipped_orders || 0}
                          </StatNumber>
                        </Stat>
                        <Stat>
                          <StatLabel>Completed Orders</StatLabel>
                          <StatNumber color="green.500">
                            {adminStats?.completed_orders || 0}
                          </StatNumber>
                        </Stat>
                      </SimpleGrid>
                      
                      <Divider />
                      
                      <VStack spacing={4} align="start">
                        <Heading as="h5" size="sm">Recent Orders</Heading>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Order ID</Th>
                              <Th>Customer</Th>
                              <Th>Amount</Th>
                              <Th>Status</Th>
                              <Th>Date</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {recentActivities?.recent_orders?.map((order: any) => (
                              <Tr key={order.id}>
                                <Td>{order.order_number}</Td>
                                <Td>{order.buyer_name}</Td>
                                <Td>${order.total_amount}</Td>
                                <Td>
                                  <Badge 
                                    colorScheme={
                                      order.status === 'completed' ? 'green' :
                                      order.status === 'pending' ? 'yellow' : 'blue'
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </Td>
                                <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                              </Tr>
                            )) || (
                              <Tr>
                                <Td colSpan={5} textAlign="center" color="gray.600">
                                  No recent orders
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </VStack>
                    </VStack>
                  </TabPanel>

                  {/* Disputes Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h4" size="md">Dispute Resolution</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <HStack>
                                <WarningIcon color="orange.500" />
                                <Heading as="h5" size="sm">Open Disputes</Heading>
                              </HStack>
                              <VStack spacing={2} align="stretch" w="full">
                                {recentActivities?.open_disputes?.map((dispute: any) => (
                                  <Card key={dispute.id} variant="outline" size="sm">
                                    <CardBody p={3}>
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="semibold" fontSize="sm">
                                          {dispute.dispute_type.replace('_', ' ')}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600">
                                          Order #{dispute.order_number}
                                        </Text>
                                        <Badge size="sm" colorScheme="orange">
                                          {dispute.status}
                                        </Badge>
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                )) || (
                                  <Text color="gray.600">No open disputes</Text>
                                )}
                              </VStack>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card>
                          <CardBody>
                            <VStack spacing={4} align="start">
                              <HStack>
                                <CheckCircleIcon color="green.500" />
                                <Heading as="h5" size="sm">Resolution Stats</Heading>
                              </HStack>
                              <SimpleGrid columns={1} gap={3} w="full">
                                <Stat>
                                  <StatLabel>Average Resolution Time</StatLabel>
                                  <StatNumber>{adminStats?.avg_resolution_time || 0} days</StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel>Resolution Rate</StatLabel>
                                  <StatNumber>{adminStats?.resolution_rate || 0}%</StatNumber>
                                </Stat>
                                <Stat>
                                  <StatLabel>Customer Satisfaction</StatLabel>
                                  <StatNumber>{adminStats?.satisfaction_rate || 0}%</StatNumber>
                                </Stat>
                              </SimpleGrid>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* System Logs Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h4" size="md">System Activity</Heading>
                      <Card>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            {recentActivities?.system_logs?.map((log: any, index: number) => (
                              <HStack key={index} justify="space-between" p={2} borderRadius="md" bg="gray.50">
                                <HStack>
                                  <Badge colorScheme={
                                    log.level === 'error' ? 'red' :
                                    log.level === 'warning' ? 'orange' : 'blue'
                                  }>
                                    {log.level}
                                  </Badge>
                                  <Text fontSize="sm">{log.message}</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
                                  {new Date(log.timestamp).toLocaleString()}
                                </Text>
                              </HStack>
                            )) || (
                              <Text color="gray.600" textAlign="center">No recent system logs</Text>
                            )}
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

export default AdminDashboardPage;
