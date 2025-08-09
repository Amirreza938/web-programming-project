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
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import {
  SearchIcon,
  BellIcon,
  CheckIcon,
  DeleteIcon,
  EmailIcon,
  InfoIcon,
  WarningIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Offer } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Type definitions for better TypeScript support
interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

const NotificationsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.700');

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiService.getNotifications(),
  });

  // Fetch user offers
  const { data: userOffers, isLoading: offersLoading } = useQuery({
    queryKey: ['userOffers'],
    queryFn: () => apiService.getMyOffers(),
  });

  // Debug: Log notifications to console
  React.useEffect(() => {
    if (notifications) {
      console.log('Received notifications:', notifications);
      console.log('Offer notifications:', notifications.filter((n: any) => n.notification_type === 'offer'));
      const notificationTypes = new Set(notifications.map((n: any) => n.notification_type));
      console.log('All notification types:', Array.from(notificationTypes));
    }
  }, [notifications]);

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => apiService.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notification marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'All notifications marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => apiService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notification deleted',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    },
  });

  // Cancel offer mutation
  const cancelOfferMutation = useMutation({
    mutationFn: (offerId: number) => apiService.cancelOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userOffers'] });
      toast({
        title: 'Offer cancelled',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
  });

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    onOpen();
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleCancelOffer = (offerId: number) => {
    cancelOfferMutation.mutate(offerId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <EmailIcon color="blue.500" />;
      case 'offer':
        return <InfoIcon color="green.500" />;
      case 'offer_accepted':
        return <CheckIcon color="green.500" />;
      case 'offer_rejected':
        return <WarningIcon color="red.500" />;
      case 'product_sold':
        return <CheckIcon color="purple.500" />;
      case 'rating':
        return <InfoIcon color="yellow.500" />;
      case 'verification':
        return <InfoIcon color="blue.500" />;
      default:
        return <BellIcon color="gray.500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'blue';
      case 'offer':
      case 'offer_accepted':
        return 'green';
      case 'offer_rejected':
        return 'red';
      case 'product_sold':
        return 'purple';
      case 'rating':
        return 'yellow';
      case 'verification':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const filteredNotifications = notifications?.filter((notification: any) => {
    if (filterType !== 'all' && notification.notification_type !== filterType) {
      return false;
    }
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;
  const offerNotificationCount = notifications?.filter((n: any) => 
    ['offer', 'offer_accepted', 'offer_rejected'].includes(n.notification_type) && !n.is_read
  ).length || 0;

  if (notificationsLoading || offersLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1000px">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <HStack>
              <BellIcon boxSize={8} color="brand.500" />
              <Heading as="h1" size="xl" color="brand.500">
                Notifications & Offers
              </Heading>
            </HStack>
            <Text color="gray.600">
              Stay updated with your latest notifications and manage your offers
            </Text>
          </VStack>

          {/* Tabs */}
          <Tabs variant="enclosed">
            <TabList>
              <Tab>
                Notifications
                {unreadCount > 0 && (
                  <Badge ml={2} colorScheme="red" borderRadius="full" fontSize="xs">
                    {unreadCount}
                  </Badge>
                )}
              </Tab>
              <Tab>
                My Offers
                {userOffers && userOffers.length > 0 && (
                  <Badge ml={2} colorScheme="blue" borderRadius="full" fontSize="xs">
                    {userOffers.length}
                  </Badge>
                )}
              </Tab>
            </TabList>

            <TabPanels>
              {/* Notifications Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Search and Filter */}
                  <Card bg={cardBg} shadow="sm">
                    <CardBody>
                      <VStack spacing={4}>
                        <InputGroup>
                          <InputLeftElement>
                            <SearchIcon color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </InputGroup>

                        <HStack justify="space-between" w="full">
                          <Menu>
                            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
                              Filter: {filterType === 'all' ? 'All Types' : filterType.replace('_', ' ')}
                            </MenuButton>
                            <MenuList>
                              <MenuItem onClick={() => setFilterType('all')}>All Types</MenuItem>
                              <MenuItem onClick={() => setFilterType('message')}>Messages</MenuItem>
                              <MenuItem onClick={() => setFilterType('offer')}>Offers</MenuItem>
                              <MenuItem onClick={() => setFilterType('offer_accepted')}>Offer Accepted</MenuItem>
                              <MenuItem onClick={() => setFilterType('offer_rejected')}>Offer Rejected</MenuItem>
                              <MenuItem onClick={() => setFilterType('product_sold')}>Product Sold</MenuItem>
                              <MenuItem onClick={() => setFilterType('rating')}>Ratings</MenuItem>
                              <MenuItem onClick={() => setFilterType('verification')}>Verification</MenuItem>
                            </MenuList>
                          </Menu>

                          <Button
                            size="sm"
                            colorScheme="brand"
                            variant="outline"
                            onClick={() => markAllAsReadMutation.mutate()}
                            isDisabled={unreadCount === 0}
                          >
                            Mark All Read
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Notifications List */}
                  {filteredNotifications.length === 0 ? (
                    <Card bg={cardBg} shadow="sm">
                      <CardBody>
                        <VStack spacing={4} py={8}>
                          <BellIcon boxSize={12} color="gray.400" />
                          <Text fontSize="lg" color="gray.500">
                            {searchTerm || filterType !== 'all' ? 'No matching notifications found' : 'No notifications yet'}
                          </Text>
                          <Text color="gray.400" textAlign="center">
                            {searchTerm || filterType !== 'all' 
                              ? 'Try adjusting your search or filter criteria'
                              : 'New notifications will appear here when you receive them'
                            }
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {filteredNotifications.map((notification: Notification) => (
                        <Card
                          key={notification.id}
                          bg={cardBg}
                          shadow="sm"
                          borderLeft={!notification.is_read ? "4px solid" : "none"}
                          borderLeftColor={!notification.is_read ? `${getNotificationColor(notification.notification_type)}.400` : "transparent"}
                          cursor="pointer"
                          _hover={{ shadow: 'md', transform: 'translateY(-1px)' }}
                          transition="all 0.2s"
                          onClick={() => handleViewNotification(notification)}
                        >
                          <CardBody>
                            <HStack justify="space-between" align="start">
                              <HStack spacing={3} flex={1}>
                                {getNotificationIcon(notification.notification_type)}
                                <VStack align="start" spacing={1} flex={1}>
                                  <HStack>
                                    <Text fontWeight="semibold" fontSize="md">
                                      {notification.title}
                                    </Text>
                                    {!notification.is_read && (
                                      <Badge colorScheme="red" size="sm">New</Badge>
                                    )}
                                    <Badge 
                                      colorScheme={getNotificationColor(notification.notification_type)} 
                                      size="sm"
                                    >
                                      {notification.notification_type.replace('_', ' ')}
                                    </Badge>
                                  </HStack>
                                  <Text color="gray.600" fontSize="sm" noOfLines={2}>
                                    {notification.message}
                                  </Text>
                                  <HStack spacing={4} fontSize="xs" color="gray.500">
                                    <Text>{new Date(notification.created_at).toLocaleString()}</Text>
                                    {notification.sender_name && (
                                      <Text>From: {notification.sender_name}</Text>
                                    )}
                                  </HStack>
                                </VStack>
                              </HStack>

                              <HStack>
                                {!notification.is_read && (
                                  <IconButton
                                    aria-label="Mark as read"
                                    icon={<CheckIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsReadMutation.mutate(notification.id);
                                    }}
                                  />
                                )}
                                <IconButton
                                  aria-label="Delete notification"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotificationMutation.mutate(notification.id);
                                  }}
                                />
                              </HStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>

              {/* Offers Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {!userOffers || userOffers.length === 0 ? (
                    <Card bg={cardBg} shadow="sm">
                      <CardBody>
                        <VStack spacing={4} py={8}>
                          <InfoIcon boxSize={12} color="gray.400" />
                          <Text fontSize="lg" color="gray.500">
                            No offers found
                          </Text>
                          <Text color="gray.400" textAlign="center">
                            Offers you make on products will appear here
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {userOffers.map((offer: Offer) => (
                        <Card
                          key={offer.id}
                          bg={cardBg}
                          shadow="sm"
                          borderLeft="4px solid"
                          borderLeftColor={`${getOfferStatusColor(offer.status)}.400`}
                        >
                          <CardBody>
                            <VStack align="start" spacing={3}>
                              <HStack justify="space-between" w="full">
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="semibold" fontSize="lg">
                                    Offer for Product #{offer.product}
                                  </Text>
                                  <HStack>
                                    <Text fontSize="xl" fontWeight="bold" color="green.500">
                                      ${offer.amount}
                                    </Text>
                                    <Badge 
                                      colorScheme={getOfferStatusColor(offer.status)} 
                                      size="lg"
                                    >
                                      {offer.status.toUpperCase()}
                                    </Badge>
                                  </HStack>
                                </VStack>

                                {offer.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() => handleCancelOffer(offer.id)}
                                    isLoading={cancelOfferMutation.isPending}
                                  >
                                    Cancel Offer
                                  </Button>
                                )}
                              </HStack>

                              {offer.message && (
                                <Box>
                                  <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                                    Message:
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {offer.message}
                                  </Text>
                                </Box>
                              )}

                              <HStack spacing={4} fontSize="xs" color="gray.500">
                                <Text>Created: {new Date(offer.created_at).toLocaleString()}</Text>
                                <Text>Buyer: {offer.buyer_name}</Text>
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Notification Detail Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Notification Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {selectedNotification && (
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      {getNotificationIcon(selectedNotification.notification_type)}
                      <Badge 
                        colorScheme={getNotificationColor(selectedNotification.notification_type)} 
                        size="lg"
                      >
                        {selectedNotification.notification_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {!selectedNotification.is_read && (
                        <Badge colorScheme="red" size="lg">NEW</Badge>
                      )}
                    </HStack>
                    
                    <VStack align="start" spacing={3}>
                      <Text fontSize="lg" fontWeight="semibold">
                        {selectedNotification.title}
                      </Text>
                      <Text color="gray.600">
                        {selectedNotification.message}
                      </Text>
                      <Divider />
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <Text>
                          <strong>Time:</strong> {new Date(selectedNotification.created_at).toLocaleString()}
                        </Text>
                        {selectedNotification.sender_name && (
                          <Text>
                            <strong>From:</strong> {selectedNotification.sender_name}
                          </Text>
                        )}
                      </HStack>
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

export default NotificationsPage;
