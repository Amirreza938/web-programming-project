import React from 'react';
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
  Divider,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  // Order approval mutations
  const approveOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiService.approveOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order Approved',
        description: 'The order has been approved successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to approve order',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiService.rejectOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order Rejected',
        description: 'The order has been rejected.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to reject order',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleApproveOrder = () => {
    if (order) {
      approveOrderMutation.mutate(order.id);
    }
  };

  const handleRejectOrder = () => {
    if (order) {
      rejectOrderMutation.mutate(order.id);
    }
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rejectionReason, setRejectionReason] = React.useState('');
  
  const cardBg = useColorModeValue('white', 'gray.700');

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiService.getOrder(parseInt(id!)),
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'confirmed':
        return 'blue';
      case 'processing':
        return 'purple';
      case 'shipped':
        return 'cyan';
      case 'delivered':
        return 'green';
      case 'cancelled':
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Your Approval';
      case 'approved':
        return 'Approved - Awaiting Payment';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !order) {
    return (
      <Container maxW="800px" py={8}>
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">
            Order not found
          </Text>
          <Button onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </VStack>
      </Container>
    );
  }

  const isSeller = user?.id === order.seller.id;
  
  // Debug logging
  console.log('OrderDetailPage Debug:', {
    currentUserId: user?.id,
    orderSellerId: order.seller.id,
    orderBuyerId: order.buyer.id,
    isSeller,
    orderStatus: order.status,
    sellerName: order.seller.full_name || order.seller.username,
    buyerName: order.buyer.full_name || order.buyer.username
  });

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1000px">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Heading as="h1" size="xl">
              Order #{order.id}
            </Heading>
            <Badge 
              colorScheme={getStatusColor(order.status)} 
              size="lg" 
              px={3} 
              py={1}
            >
              {getStatusText(order.status)}
            </Badge>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Order Details */}
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" size="md">Order Details</Heading>
                  
                  <HStack spacing={4}>
                    <Image
                      src={order.product?.main_image || 'https://via.placeholder.com/100'}
                      alt={order.product?.title || 'Product'}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="semibold" fontSize="lg">
                        {order.product?.title || 'Product'}
                      </Text>
                      <Text color="gray.600">
                        Quantity: 1
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.500">
                        ${order.total_amount}
                      </Text>
                    </VStack>
                  </HStack>

                  <Divider />

                  <VStack align="start" spacing={2}>
                    <Text><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</Text>
                    <Text><strong>Buyer:</strong> {order.buyer.full_name || order.buyer.username}</Text>
                    <Text><strong>Seller:</strong> {order.seller.full_name || order.seller.username}</Text>
                    <Text><strong>Status:</strong> {getStatusText(order.status)}</Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Shipping Information */}
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" size="md">Shipping Information</Heading>
                  
                  {order.shipping_address ? (
                    <VStack align="start" spacing={2}>
                      <Text><strong>Address:</strong></Text>
                      <Text color="gray.700">{order.shipping_address}</Text>
                    </VStack>
                  ) : (
                    <Text color="gray.500">No shipping information available</Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Action Buttons for Seller */}
          {isSeller && order.status === 'pending' && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4}>
                  <Heading as="h3" size="md">Order Approval Required</Heading>
                  <Text textAlign="center" color="gray.600">
                    This order is waiting for your approval. Please review the details and decide whether to approve or reject this order.
                  </Text>
                  
                  <HStack spacing={4} w="full" justify="center">
                    <Button
                      colorScheme="red"
                      variant="outline"
                      onClick={onOpen}
                      isLoading={rejectOrderMutation.isPending}
                    >
                      Reject Order
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={handleApproveOrder}
                      isLoading={approveOrderMutation.isPending}
                    >
                      Approve Order
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Status Information for Non-Sellers or Approved Orders */}
          {(!isSeller || order.status !== 'pending') && (
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4}>
                  <Heading as="h3" size="md">Order Status</Heading>
                  
                  {order.status === 'approved' && (
                    <Alert status="success">
                      <AlertIcon />
                      <Text>This order has been approved by the seller and is awaiting payment processing.</Text>
                    </Alert>
                  )}
                  
                  {order.status === 'rejected' && (
                    <Alert status="error">
                      <AlertIcon />
                      <Text>This order has been rejected by the seller.</Text>
                    </Alert>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <Alert status="info">
                      <AlertIcon />
                      <Text>This order has been confirmed and is being processed.</Text>
                    </Alert>
                  )}
                  
                  {order.status === 'shipped' && (
                    <Alert status="info">
                      <AlertIcon />
                      <Text>This order has been shipped and is on its way.</Text>
                    </Alert>
                  )}
                  
                  {order.status === 'delivered' && (
                    <Alert status="success">
                      <AlertIcon />
                      <Text>This order has been delivered successfully.</Text>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Back Button */}
          <HStack justify="center">
            <Button
              variant="outline"
              onClick={() => navigate('/orders')}
            >
              Back to Orders
            </Button>
          </HStack>
        </VStack>

        {/* Rejection Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reject Order</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Text>
                  Are you sure you want to reject this order? This action cannot be undone.
                </Text>
                <Textarea
                  placeholder="Reason for rejection (optional)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
                <HStack spacing={4} w="full">
                  <Button onClick={onClose} variant="outline" flex={1}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleRejectOrder}
                    flex={1}
                    isLoading={rejectOrderMutation.isPending}
                  >
                    Reject Order
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

export default OrderDetailPage;
