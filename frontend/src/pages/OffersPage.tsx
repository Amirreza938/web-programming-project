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
  SimpleGrid,
  Badge,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, Offer } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Fetch received offers (offers on my products)
  const { data: receivedOffers, isLoading: receivedLoading } = useQuery({
    queryKey: ['receivedOffers'],
    queryFn: () => apiService.getMyReceivedOffers(),
  });

  // Fetch my offers (offers I made)
  const { data: myOffers, isLoading: myOffersLoading } = useQuery({
    queryKey: ['myOffers'],
    queryFn: () => apiService.getMyOffers(),
  });

  // Accept offer mutation
  const acceptOfferMutation = useMutation({
    mutationFn: (offerId: number) => apiService.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivedOffers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Offer Accepted!',
        description: 'The offer has been accepted. The buyer will be notified.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to accept offer',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Reject offer mutation
  const rejectOfferMutation = useMutation({
    mutationFn: (offerId: number) => apiService.rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivedOffers'] });
      toast({
        title: 'Offer Rejected',
        description: 'The offer has been rejected. The buyer will be notified.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      setIsRejectModalOpen(false);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to reject offer',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Cancel offer mutation (for my offers)
  const cancelOfferMutation = useMutation({
    mutationFn: (offerId: number) => apiService.cancelOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOffers'] });
      toast({
        title: 'Offer Cancelled',
        description: 'Your offer has been cancelled.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to cancel offer',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleAcceptOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    onOpen();
  };

  const confirmAcceptOffer = () => {
    if (selectedOffer) {
      acceptOfferMutation.mutate(selectedOffer.id);
    }
  };

  const handleRejectOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsRejectModalOpen(true);
  };

  const confirmRejectOffer = () => {
    if (selectedOffer) {
      rejectOfferMutation.mutate(selectedOffer.id);
    }
  };

  const handleCancelOffer = (offer: Offer) => {
    cancelOfferMutation.mutate(offer.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderOfferCard = (offer: Offer, isReceived: boolean = false) => (
    <Card key={offer.id} shadow="md">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack>
            <Image
              src={offer.product_image || '/placeholder-image.jpg'}
              alt={offer.product_title}
              boxSize="60px"
              borderRadius="md"
              objectFit="cover"
            />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="bold" fontSize="sm">
                {offer.product_title}
              </Text>
              <Text fontSize="xs" color="gray.600">
                Product ID: {offer.product}
              </Text>
            </VStack>
            <Badge colorScheme={getStatusColor(offer.status)}>
              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </Badge>
          </HStack>

          <Box>
            <Text fontSize="lg" fontWeight="bold" color="green.500">
              Offer: ${offer.amount}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {isReceived ? `From: ${offer.buyer_name}` : `Product: ${offer.product_title}`}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDate(offer.created_at)}
            </Text>
          </Box>

          {offer.message && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold">Message:</Text>
              <Text fontSize="sm" color="gray.600">{offer.message}</Text>
            </Box>
          )}

          {offer.status === 'pending' && (
            <HStack spacing={2}>
              {isReceived ? (
                <>
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => handleAcceptOffer(offer)}
                    isLoading={acceptOfferMutation.isPending}
                  >
                    Accept
                  </Button>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRejectOffer(offer)}
                    isLoading={rejectOfferMutation.isPending}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <Button
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelOffer(offer)}
                  isLoading={cancelOfferMutation.isPending}
                >
                  Cancel Offer
                </Button>
              )}
            </HStack>
          )}

          {offer.status === 'accepted' && !isReceived && (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => navigate(`/products/${offer.product}/checkout?offer=${offer.id}`)}
            >
              Proceed to Purchase
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  if (!user?.can_sell && !user?.can_buy) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning">
          <AlertIcon />
          You need to be approved as a seller to view this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Offers Management
          </Heading>
          <Text color="gray.600">
            Manage offers you've received and made
          </Text>
        </Box>

        <Tabs variant="enclosed">
          <TabList>
            {user?.can_sell && (
              <Tab>
                Received Offers 
                {receivedOffers && receivedOffers.filter(o => o.status === 'pending').length > 0 && (
                  <Badge ml={2} colorScheme="red">
                    {receivedOffers.filter(o => o.status === 'pending').length}
                  </Badge>
                )}
              </Tab>
            )}
            <Tab>
              My Offers
              {myOffers && myOffers.filter(o => o.status === 'pending').length > 0 && (
                <Badge ml={2} colorScheme="yellow">
                  {myOffers.filter(o => o.status === 'pending').length}
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {user?.can_sell && (
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading as="h3" size="md" mb={4}>
                      Offers on Your Products
                    </Heading>
                    {receivedLoading ? (
                      <LoadingSpinner />
                    ) : receivedOffers && receivedOffers.length > 0 ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {receivedOffers.map(offer => renderOfferCard(offer, true))}
                      </SimpleGrid>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        No offers received yet. Promote your products to get more offers!
                      </Alert>
                    )}
                  </Box>
                </VStack>
              </TabPanel>
            )}

            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    Offers You've Made
                  </Heading>
                  {myOffersLoading ? (
                    <LoadingSpinner />
                  ) : myOffers && myOffers.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {myOffers.map(offer => renderOfferCard(offer, false))}
                    </SimpleGrid>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      You haven't made any offers yet. Browse products and make offers to start negotiating!
                    </Alert>
                  )}
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Accept Offer Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Accept Offer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOffer && (
              <VStack spacing={4} align="stretch">
                <Text>
                  Are you sure you want to accept this offer of{' '}
                  <Text as="span" fontWeight="bold" color="green.500">
                    ${selectedOffer.amount}
                  </Text>{' '}
                  for "{selectedOffer.product_title}"?
                </Text>
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm">
                      By accepting this offer:
                    </Text>
                    <VStack align="start" spacing={1} mt={2} fontSize="sm">
                      <Text>• Your product will be marked as sold</Text>
                      <Text>• The buyer will be notified</Text>
                      <Text>• Other pending offers will be cancelled</Text>
                      <Text>• The buyer can proceed to purchase</Text>
                    </VStack>
                  </Box>
                </Alert>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={confirmAcceptOffer}
              isLoading={acceptOfferMutation.isPending}
            >
              Accept Offer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Offer Modal */}
      <AlertDialog
        isOpen={isRejectModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsRejectModalOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Reject Offer
            </AlertDialogHeader>

            <AlertDialogBody>
              {selectedOffer && (
                <VStack spacing={4} align="stretch">
                  <Text>
                    Are you sure you want to reject the offer of{' '}
                    <Text as="span" fontWeight="bold">
                      ${selectedOffer.amount}
                    </Text>{' '}
                    for "{selectedOffer.product_title}"?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    The buyer will be notified of the rejection.
                  </Text>
                </VStack>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmRejectOffer}
                ml={3}
                isLoading={rejectOfferMutation.isPending}
              >
                Reject Offer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default OffersPage;
