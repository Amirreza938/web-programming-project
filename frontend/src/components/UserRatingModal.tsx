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
  Avatar,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface UserRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  userAvatar?: string;
  userType: 'buyer' | 'seller';
  orderId: number;
}

const UserRatingModal: React.FC<UserRatingModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userAvatar,
  userType,
  orderId,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const toast = useToast();
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: (ratingData: any) => apiService.createUserRating(userId, ratingData),
    onSuccess: () => {
      toast({
        title: 'Rating submitted',
        description: `Thank you for rating this ${userType}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Invalidate user ratings and profile queries
      queryClient.invalidateQueries({ queryKey: ['user-ratings', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      onClose();
      setRating(0);
      setReview('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error submitting rating',
        description: error.response?.data?.error || error.response?.data?.message || 'Unable to submit rating',
        status: 'error',
        duration: 5000,
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
      order: orderId,
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
        <ModalHeader>Rate {userType === 'seller' ? 'Seller' : 'Buyer'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* User Info */}
            <HStack spacing={3}>
              <Avatar size="md" src={userAvatar} name={userName} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="semibold">
                  {userName}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Rate your experience with this {userType}
                </Text>
              </VStack>
            </HStack>
            
            {/* Rating Stars */}
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
              {rating > 0 && (
                <Text mt={1} fontSize="sm" color="gray.600">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </Text>
              )}
            </Box>

            {/* Review Text */}
            <Box>
              <Text mb={2} fontWeight="semibold">
                Review (Optional):
              </Text>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={`Share your experience with this ${userType}...`}
                rows={4}
              />
            </Box>

            {/* Action Buttons */}
            <HStack spacing={4} justify="flex-end" pt={2}>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
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

export default UserRatingModal;
