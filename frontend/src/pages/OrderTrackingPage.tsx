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
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Alert,
  AlertIcon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import {
  SearchIcon,
  TimeIcon,
  CheckIcon,
  WarningIcon,
  InfoIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const timelineBg = useColorModeValue('gray.50', 'gray.800');

  // Fetch order details and tracking information
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['orderTracking', orderId],
    queryFn: () => apiService.getOrderTracking(parseInt(orderId!)),
    enabled: !!orderId,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'yellow';
      case 'confirmed':
        return 'blue';
      case 'processing':
        return 'purple';
      case 'shipped':
        return 'cyan';
      case 'out_for_delivery':
        return 'orange';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'refunded':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <TimeIcon />;
      case 'confirmed':
      case 'processing':
        return <InfoIcon />;
      case 'shipped':
      case 'out_for_delivery':
        return <ChevronRightIcon />;
      case 'delivered':
        return <CheckIcon />;
      case 'cancelled':
      case 'refunded':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 10;
      case 'confirmed':
        return 25;
      case 'processing':
        return 40;
      case 'shipped':
        return 60;
      case 'out_for_delivery':
        return 80;
      case 'delivered':
        return 100;
      case 'cancelled':
      case 'refunded':
        return 0;
      default:
        return 0;
    }
  };

  const orderSteps = [
    {
      title: 'Order Placed',
      description: 'Your order has been received',
      status: 'pending'
    },
    {
      title: 'Confirmed',
      description: 'Seller has confirmed your order',
      status: 'confirmed'
    },
    {
      title: 'Processing',
      description: 'Your order is being prepared',
      status: 'processing'
    },
    {
      title: 'Shipped',
      description: 'Your order is on its way',
      status: 'shipped'
    },
    {
      title: 'Delivered',
      description: 'Order has been delivered',
      status: 'delivered'
    }
  ];

  const getCurrentStepIndex = (currentStatus: string) => {
    return orderSteps.findIndex(step => step.status === currentStatus.toLowerCase());
  };

  const handleViewUpdate = (update: any) => {
    setSelectedUpdate(update);
    onOpen();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!orderData) {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="800px">
          <VStack spacing={8}>
            <Text fontSize="xl" color="red.500">
              Order not found
            </Text>
            <Button onClick={() => window.location.href = '/orders'}>
              Back to Orders
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  const currentStepIndex = getCurrentStepIndex(orderData.status);
  const progressPercentage = getProgressPercentage(orderData.status);

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1000px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              Order Tracking
            </Heading>
            <Text color="gray.600">
              Track your order #{orderData.order_number}
            </Text>
          </VStack>

          {/* Order Summary */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Image
                      src={orderData.product_image || 'https://via.placeholder.com/80'}
                      alt={orderData.product_title}
                      boxSize="80px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {orderData.product_title}
                      </Text>
                      <Text color="gray.600">
                        Order #{orderData.order_number}
                      </Text>
                      <Badge colorScheme={getStatusColor(orderData.status)} size="lg">
                        {orderData.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack align="start" spacing={4}>
                  <SimpleGrid columns={2} gap={4} w="full">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Order Date</Text>
                      <Text fontWeight="semibold">
                        {new Date(orderData.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Total Amount</Text>
                      <Text fontWeight="semibold" color="green.500">
                        ${orderData.total_amount}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Seller</Text>
                      <Text fontWeight="semibold">
                        {orderData.seller_name}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Shipping Method</Text>
                      <Text fontWeight="semibold">
                        {orderData.shipping_method || 'Standard'}
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Progress Bar */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={6}>
                <VStack spacing={2} textAlign="center">
                  <Text fontSize="lg" fontWeight="semibold">
                    Order Progress
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                    {progressPercentage}%
                  </Text>
                </VStack>
                
                <Progress
                  value={progressPercentage}
                  colorScheme={getStatusColor(orderData.status)}
                  size="lg"
                  borderRadius="md"
                  w="full"
                />

                <HStack justify="space-between" w="full" fontSize="sm">
                  <Text color="gray.600">Order Placed</Text>
                  <Text color="gray.600">In Progress</Text>
                  <Text color="gray.600">Delivered</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Order Steps */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h3" size="md">Order Timeline</Heading>
                
                <Box w="full" p={4} bg={timelineBg} borderRadius="md">
                  <Stepper 
                    index={currentStepIndex} 
                    orientation="vertical" 
                    height="300px" 
                    gap="0"
                    colorScheme={getStatusColor(orderData.status)}
                  >
                    {orderSteps.map((step, index) => (
                      <Step key={index}>
                        <StepIndicator>
                          <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                          />
                        </StepIndicator>

                        <Box flexShrink="0" ml={4}>
                          <StepTitle>{step.title}</StepTitle>
                          <StepDescription>{step.description}</StepDescription>
                          {index <= currentStepIndex && orderData.status_updates && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {orderData.status_updates[index]?.timestamp && 
                                new Date(orderData.status_updates[index].timestamp).toLocaleString()
                              }
                            </Text>
                          )}
                        </Box>

                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Tracking Information */}
          {orderData.tracking_number && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" size="md">Shipping Information</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Text fontWeight="semibold">Tracking Number:</Text>
                        <Text color="brand.500" fontFamily="mono">
                          {orderData.tracking_number}
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="semibold">Carrier:</Text>
                        <Text>{orderData.shipping_carrier || 'Standard Shipping'}</Text>
                      </HStack>
                      {orderData.estimated_delivery && (
                        <HStack>
                          <Text fontWeight="semibold">Estimated Delivery:</Text>
                          <Text>{new Date(orderData.estimated_delivery).toLocaleDateString()}</Text>
                        </HStack>
                      )}
                    </VStack>

                    <VStack align="start" spacing={3}>
                      <Text fontWeight="semibold">Shipping Address:</Text>
                      <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                        <Text>{orderData.shipping_address}</Text>
                        <Text>{orderData.shipping_city}, {orderData.shipping_country}</Text>
                        <Text>{orderData.shipping_postal_code}</Text>
                      </VStack>
                    </VStack>
                  </SimpleGrid>

                  {orderData.tracking_url && (
                    <Button
                      colorScheme="brand"
                      variant="outline"
                      onClick={() => window.open(orderData.tracking_url, '_blank')}
                    >
                      Track with Carrier
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Status Updates */}
          {orderData.status_updates && orderData.status_updates.length > 0 && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" size="md">Status Updates</Heading>
                  
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date & Time</Th>
                        <Th>Status</Th>
                        <Th>Description</Th>
                        <Th>Location</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orderData.status_updates.map((update: any, index: number) => (
                        <Tr 
                          key={index}
                          cursor="pointer"
                          _hover={{ bg: 'gray.50' }}
                          onClick={() => handleViewUpdate(update)}
                        >
                          <Td>
                            {new Date(update.timestamp).toLocaleString()}
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(update.status)}>
                              {update.status.replace('_', ' ')}
                            </Badge>
                          </Td>
                          <Td>{update.description}</Td>
                          <Td>{update.location || '-'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Actions */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={4}>
                <Heading as="h3" size="md">Need Help?</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} w="full">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `/chat?order=${orderData.id}`}
                  >
                    Contact Seller
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/support'}
                  >
                    Customer Support
                  </Button>
                  
                  {orderData.status === 'delivered' && (
                    <Button
                      colorScheme="brand"
                      onClick={() => window.location.href = `/orders/${orderData.id}/review`}
                    >
                      Leave Review
                    </Button>
                  )}
                </SimpleGrid>

                {(orderData.status === 'pending' || orderData.status === 'confirmed') && (
                  <Alert status="info">
                    <AlertIcon />
                    <Text fontSize="sm">
                      You can cancel this order within 24 hours of placing it. 
                      Contact customer support if you need assistance.
                    </Text>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Status Update Detail Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Status Update Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {selectedUpdate && (
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      {getStatusIcon(selectedUpdate.status)}
                      <Badge colorScheme={getStatusColor(selectedUpdate.status)} size="lg">
                        {selectedUpdate.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </HStack>
                    
                    <VStack align="start" spacing={2}>
                      <Text><strong>Time:</strong> {new Date(selectedUpdate.timestamp).toLocaleString()}</Text>
                      <Text><strong>Description:</strong> {selectedUpdate.description}</Text>
                      {selectedUpdate.location && (
                        <Text><strong>Location:</strong> {selectedUpdate.location}</Text>
                      )}
                      {selectedUpdate.notes && (
                        <Text><strong>Notes:</strong> {selectedUpdate.notes}</Text>
                      )}
                    </VStack>
                  </VStack>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
};

export default OrderTrackingPage;
