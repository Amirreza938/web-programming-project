import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Image,
  Badge,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  useDisclosure,
  SimpleGrid,
  Flex,
  Spacer,
  Tag,
  TagLabel,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { apiService, Product } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminProductVerificationPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [notes, setNotes] = useState('');

  // Fetch pending products
  const { data: pendingProducts, isLoading } = useQuery({
    queryKey: ['pendingProducts'],
    queryFn: () => apiService.getPendingProducts(),
  });

  // Verify product mutation
  const verifyMutation = useMutation({
    mutationFn: ({ productId, notes }: { productId: number; notes?: string }) =>
      apiService.verifyProduct(productId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      toast({
        title: 'Product verified',
        description: 'The product has been successfully verified and is now live.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error verifying product',
        description: error.response?.data?.error || 'Failed to verify product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Reject product mutation
  const rejectMutation = useMutation({
    mutationFn: ({ productId, reason }: { productId: number; reason: string }) =>
      apiService.rejectProduct(productId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      toast({
        title: 'Product rejected',
        description: 'The product has been rejected and the seller has been notified.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error rejecting product',
        description: error.response?.data?.error || 'Failed to reject product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleProductAction = (product: Product, action: 'verify' | 'reject') => {
    setSelectedProduct(product);
    setActionType(action);
    setNotes('');
    onOpen();
  };

  const handleSubmitAction = () => {
    if (!selectedProduct) return;

    if (actionType === 'verify') {
      verifyMutation.mutate({
        productId: selectedProduct.id,
        notes: notes.trim() || undefined,
      });
    } else {
      if (!notes.trim()) {
        toast({
          title: 'Rejection reason required',
          description: 'Please provide a reason for rejecting this product',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      rejectMutation.mutate({
        productId: selectedProduct.id,
        reason: notes.trim(),
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Product Verification
          </Heading>
          <Text color="gray.600">
            Review and verify products submitted by sellers before they go live on the platform.
          </Text>
        </Box>

        {!pendingProducts || pendingProducts.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>No pending products!</AlertTitle>
              <AlertDescription>
                All products have been reviewed. New submissions will appear here.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <Flex align="center" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                {pendingProducts.length} product{pendingProducts.length !== 1 ? 's' : ''} pending verification
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {pendingProducts.map((product) => (
                <Card key={product.id} size="sm">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {product.main_image && (
                        <Image
                          src={product.main_image}
                          alt={product.title}
                          borderRadius="md"
                          objectFit="cover"
                          h="200px"
                          w="100%"
                        />
                      )}

                      <VStack spacing={2} align="stretch">
                        <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                          {product.title}
                        </Text>
                        
                        <HStack>
                          <Tag size="sm" colorScheme="blue">
                            <TagLabel>{product.category_name}</TagLabel>
                          </Tag>
                          <Tag size="sm" colorScheme="gray">
                            <TagLabel>{product.condition}</TagLabel>
                          </Tag>
                        </HStack>

                        <Text fontSize="lg" fontWeight="bold" color="green.500">
                          {formatPrice(product.price)}
                        </Text>

                        <VStack spacing={1} align="stretch" fontSize="sm" color="gray.600">
                          <Text><strong>Seller:</strong> {product.seller_name}</Text>
                          <Text><strong>Location:</strong> {product.location}</Text>
                          <Text><strong>Submitted:</strong> {formatDate(product.created_at)}</Text>
                        </VStack>

                        <Text fontSize="sm" color="gray.700" noOfLines={3}>
                          {product.description}
                        </Text>
                      </VStack>

                      <Divider />

                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<CheckIcon />}
                          onClick={() => handleProductAction(product, 'verify')}
                          flex={1}
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          leftIcon={<CloseIcon />}
                          onClick={() => handleProductAction(product, 'reject')}
                          flex={1}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<ViewIcon />}
                          onClick={() => window.open(`/products/${product.id}`, '_blank')}
                        >
                          View
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </>
        )}
      </VStack>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionType === 'verify' ? 'Verify Product' : 'Reject Product'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Product: <strong>{selectedProduct?.title}</strong>
              </Text>
              
              <Box>
                <Text mb={2} fontWeight="medium">
                  {actionType === 'verify' ? 'Notes (Optional)' : 'Rejection Reason (Required)'}
                </Text>
                <Textarea
                  placeholder={
                    actionType === 'verify'
                      ? 'Add any notes about this verification...'
                      : 'Please provide a clear reason for rejecting this product...'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  minH="100px"
                  isRequired={actionType === 'reject'}
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme={actionType === 'verify' ? 'green' : 'red'}
              onClick={handleSubmitAction}
              isLoading={verifyMutation.isPending || rejectMutation.isPending}
              loadingText={actionType === 'verify' ? 'Verifying...' : 'Rejecting...'}
            >
              {actionType === 'verify' ? 'Verify Product' : 'Reject Product'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminProductVerificationPage;