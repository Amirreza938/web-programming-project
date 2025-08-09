import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  useToast,
  Box,
  Icon,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface ProductRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productTitle: string;
}

const ProductRatingModal: React.FC<ProductRatingModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const toast = useToast();
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: (ratingData: any) => apiService.createProductRating(productId, ratingData),
    onSuccess: () => {
      toast({
        title: 'Rating submitted',
        description: 'Thank you for your feedback!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      onClose();
      setRating(0);
      setReview('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error submitting rating',
        description: error.response?.data?.message || 'Unable to submit rating',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    submitRatingMutation.mutate({
      rating,
      review: review.trim() || null,
    });
  };

  const handleClose = () => {
    onClose();
    setRating(0);
    setReview('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Rate Product</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold">
              {productTitle}
            </Text>
            
            <Box>
              <Text mb={2} fontWeight="semibold">
                Your Rating:
              </Text>
              <HStack spacing={1}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    as={StarIcon}
                    boxSize={8}
                    color={star <= (hoverRating || rating) ? 'yellow.400' : 'gray.300'}
                    cursor="pointer"
                    _hover={{ color: 'yellow.400' }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </HStack>
            </Box>

            <Box>
              <Text mb={2} fontWeight="semibold">
                Review (Optional):
              </Text>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </Box>

            <HStack spacing={4} justify="flex-end">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleSubmit}
                isLoading={submitRatingMutation.isPending}
                loadingText="Submitting..."
              >
                Submit Rating
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProductRatingModal;
