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
  Image,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  ChatIcon,
  ViewIcon,
  CheckCircleIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import UserRatingModal from '../components/UserRatingModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OrdersPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isRatingOpen, 
    onOpen: onRatingOpen, 
    onClose: onRatingClose 
  } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [disputeMessage, setDisputeMessage] = useState('');
  const [ratingUser, setRatingUser] = useState<{
    id: number;
    name: string;
    avatar?: string;
    type: 'buyer' | 'seller';
    orderId: number;
  } | null>(null);

  // Fetch user orders (as buyer)
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['userOrders'],
    queryFn: () => apiService.getUserOrders(),
  });

  // Fetch user sales (as seller)
  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['userSales'],
    queryFn: () => apiService.getUserSales(),
  });

  // Mutations
  const shipOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiService.shipOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userSales'] });
      toast({
        title: 'Order marked as shipped',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Error updating order',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deliverOrderMutation = useMutation({
    mutationFn: (orderId: number) => apiService.deliverOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['userSales'] });
      toast({
        title: 'Order marked as delivered',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Error updating order',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const createDisputeMutation = useMutation({
    mutationFn: (data: { orderId: number; message: string }) =>
      apiService.createDispute(data.orderId, { message: data.message }),
    onSuccess: () => {
      setDisputeMessage('');
      onClose();
      toast({
        title: 'Dispute created',
        description: 'We will review your dispute and get back to you.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Error creating dispute',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleShipOrder = (orderId: number) => {
    shipOrderMutation.mutate(orderId);
  };

  const handleDeliverOrder = (orderId: number) => {
    deliverOrderMutation.mutate(orderId);
  };

  const handleCreateDispute = (order: any) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleSubmitDispute = () => {
    if (!disputeMessage.trim()) {
      toast({
        title: 'Please enter a message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    createDisputeMutation.mutate({
      orderId: selectedOrder.id,
      message: disputeMessage,
    });
  };

  const handleRateUser = (userType: 'buyer' | 'seller', order: any) => {
    const isRatingSeller = userType === 'seller';
    const userId = isRatingSeller ? order.seller_id : order.buyer_id;
    const userName = isRatingSeller ? order.seller_name : order.buyer_name;
    const userAvatar = isRatingSeller ? order.seller_profile_image : order.buyer_profile_image;

    if (!userId) {
      toast({
        title: 'Error',
        description: 'User information not available',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setRatingUser({
      id: userId,
      name: userName || 'User',
      avatar: userAvatar,
      type: userType,
      orderId: order.id,
    });
    onRatingOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'confirmed':
        return 'blue';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (ordersLoading || salesLoading) {
    return <LoadingSpinner />;
  }

  const OrderCard = ({ order, isSeller = false }: { order: any; isSeller?: boolean }) => (
    <Card bg={cardBg} shadow="md">
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Order Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold" fontSize="lg">
                {order.product_title}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Order #{order.id}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </VStack>
            
            <Badge
              colorScheme={getStatusColor(order.status)}
              variant="outline"
              size="lg"
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </HStack>

          {/* Product Image and Details */}
          <HStack spacing={4}>
            <Image
              src={order.product_image || 'https://via.placeholder.com/80x80?text=No+Image'}
              alt={order.product_title}
              w="80px"
              h="80px"
              objectFit="cover"
              borderRadius="md"
            />
            
            <VStack align="start" spacing={2} flex={1}>
              <Text fontSize="lg" fontWeight="bold" color="brand.500">
                ${order.total_amount}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Quantity: {order.quantity}
              </Text>
              {order.shipping_address && (
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  {order.shipping_address}
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Action Buttons */}
          <HStack spacing={3} justify="space-between">
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                View Details
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ChatIcon />}
                onClick={() => navigate(`/chat?conversation=${order.conversation_id}`)}
              >
                Message
              </Button>
            </HStack>

            {/* Seller Actions */}
            {isSeller && order.status === 'approved' && (
              <Button
                size="sm"
                colorScheme="brand"
                onClick={() => handleShipOrder(order.id)}
                isLoading={shipOrderMutation.isPending}
              >
                Mark Shipped
              </Button>
            )}

            {/* Buyer Actions */}
            {!isSeller && order.status === 'shipped' && (
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => handleDeliverOrder(order.id)}
                isLoading={deliverOrderMutation.isPending}
              >
                Mark Delivered
              </Button>
            )}

            {/* Dispute Button */}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={() => handleCreateDispute(order)}
              >
                Report Issue
              </Button>
            )}

            {/* Rating Buttons - Show when order is delivered */}
            {order.status === 'delivered' && (
              <>
                {/* Rate Seller Button (for buyers) */}
                {!isSeller && (
                  <Button
                    size="sm"
                    colorScheme="yellow"
                    variant="outline"
                    leftIcon={<StarIcon />}
                    onClick={() => handleRateUser('seller', order)}
                  >
                    Rate Seller
                  </Button>
                )}
                
                {/* Rate Buyer Button (for sellers) */}
                {isSeller && (
                  <Button
                    size="sm"
                    colorScheme="yellow"
                    variant="outline"
                    leftIcon={<StarIcon />}
                    onClick={() => handleRateUser('buyer', order)}
                  >
                    Rate Buyer
                  </Button>
                )}
              </>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              My Orders & Sales
            </Heading>
            <Text color="gray.600">
              Track your purchases and manage your sales
            </Text>
          </VStack>

          {/* Tabs */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={6}>
              <Tabs variant="enclosed">
                <TabList>
                  <Tab>My Orders ({orders?.count || 0})</Tab>
                  <Tab>My Sales ({sales?.count || 0})</Tab>
                </TabList>

                <TabPanels>
                  {/* My Orders */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {orders?.results && orders.results.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                          {orders.results.map((order: any) => (
                            <OrderCard key={order.id} order={order} />
                          ))}
                        </SimpleGrid>
                      ) : (
                        <VStack spacing={4} py={12}>
                          <Text color="gray.600" textAlign="center">
                            You haven't made any orders yet
                          </Text>
                          <Button
                            colorScheme="brand"
                            onClick={() => window.location.href = '/products'}
                          >
                            Start Shopping
                          </Button>
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* My Sales */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {sales?.results && sales.results.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                          {sales.results.map((sale: any) => (
                            <OrderCard key={sale.id} order={sale} isSeller={true} />
                          ))}
                        </SimpleGrid>
                      ) : (
                        <VStack spacing={4} py={12}>
                          <Text color="gray.600" textAlign="center">
                            You haven't made any sales yet
                          </Text>
                          <Button
                            colorScheme="brand"
                            onClick={() => window.location.href = '/create-product'}
                          >
                            Create Your First Listing
                          </Button>
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>

        {/* Dispute Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Report an Issue</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Text>
                  Please describe the issue you're experiencing with order #{selectedOrder?.id}
                </Text>
                
                <FormControl>
                  <FormLabel>Issue Description</FormLabel>
                  <Textarea
                    placeholder="Describe the problem..."
                    value={disputeMessage}
                    onChange={(e) => setDisputeMessage(e.target.value)}
                    rows={4}
                  />
                </FormControl>
                
                <HStack spacing={4} w="full">
                  <Button onClick={onClose} variant="outline" flex={1}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleSubmitDispute}
                    flex={1}
                    isLoading={createDisputeMutation.isPending}
                  >
                    Submit Report
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* User Rating Modal */}
        {ratingUser && (
          <UserRatingModal
            isOpen={isRatingOpen}
            onClose={onRatingClose}
            userId={ratingUser.id}
            userName={ratingUser.name}
            userAvatar={ratingUser.avatar}
            userType={ratingUser.type}
            orderId={ratingUser.orderId}
          />
        )}
      </Container>
    </Box>
  );
};

export default OrdersPage; 