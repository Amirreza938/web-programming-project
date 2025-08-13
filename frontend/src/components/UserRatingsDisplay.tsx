import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
  Card,
  CardBody,
  Avatar,
  Divider,
  Icon,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';

interface UserRatingsDisplayProps {
  userId: number;
  showTitle?: boolean;
}

const UserRatingsDisplay: React.FC<UserRatingsDisplayProps> = ({ 
  userId, 
  showTitle = true 
}) => {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['user-ratings', userId],
    queryFn: () => apiService.getUserRatings(userId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!ratings || ratings.length === 0) {
    return (
      <VStack spacing={4} p={6} textAlign="center">
        {showTitle && (
          <Text fontSize="lg" fontWeight="semibold">
            User Reviews
          </Text>
        )}
        <Text color="gray.500">No reviews yet</Text>
      </VStack>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <HStack spacing={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            as={StarIcon}
            boxSize={4}
            color={star <= rating ? 'yellow.400' : 'gray.300'}
          />
        ))}
      </HStack>
    );
  };

  const getAverageRating = () => {
    const total = ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((rating: any) => {
      counts[rating.rating as keyof typeof counts]++;
    });
    return counts;
  };

  const ratingCounts = getRatingCounts();

  return (
    <VStack spacing={6} align="stretch">
      {showTitle && (
        <Text fontSize="lg" fontWeight="semibold">
          User Reviews ({ratings.length})
        </Text>
      )}

      {/* Rating Summary */}
      <Card>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {/* Average Rating */}
            <VStack spacing={2}>
              <Text fontSize="3xl" fontWeight="bold">
                {getAverageRating()}
              </Text>
              {renderStars(Math.round(parseFloat(getAverageRating())))}
              <Text fontSize="sm" color="gray.600">
                Based on {ratings.length} review{ratings.length !== 1 ? 's' : ''}
              </Text>
            </VStack>

            {/* Rating Breakdown */}
            <VStack spacing={2} align="start">
              {[5, 4, 3, 2, 1].map((star) => (
                <HStack key={star} spacing={2} w="full">
                  <Text fontSize="sm" minW="12px">
                    {star}
                  </Text>
                  <Icon as={StarIcon} boxSize={3} color="yellow.400" />
                  <Box flex={1} bg="gray.200" h="6px" borderRadius="full">
                    <Box
                      bg="yellow.400"
                      h="full"
                      borderRadius="full"
                      w={`${(ratingCounts[star as keyof typeof ratingCounts] / ratings.length) * 100}%`}
                    />
                  </Box>
                  <Text fontSize="sm" minW="20px">
                    {ratingCounts[star as keyof typeof ratingCounts]}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Individual Reviews */}
      <VStack spacing={4} align="stretch">
        {ratings.map((rating: any) => (
          <Card key={rating.id}>
            <CardBody>
              <VStack spacing={3} align="start">
                <HStack spacing={3} w="full">
                  <Avatar
                    size="sm"
                    src={rating.from_user_image}
                    name={rating.from_user_name}
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {rating.from_user_name}
                    </Text>
                    <HStack spacing={2}>
                      {renderStars(rating.rating)}
                      <Text fontSize="xs" color="gray.500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </Text>
                    </HStack>
                  </VStack>
                  <Badge colorScheme="blue" variant="subtle">
                    {rating.rating}/5
                  </Badge>
                </HStack>
                
                {rating.review && (
                  <>
                    <Divider />
                    <Text fontSize="sm" color="gray.700">
                      {rating.review}
                    </Text>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </VStack>
  );
};

export default UserRatingsDisplay;
