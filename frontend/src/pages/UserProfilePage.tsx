import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Badge,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { StarIcon, CalendarIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserRatingsDisplay from '../components/UserRatingsDisplay';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => apiService.getUserProfile(Number(userId)),
    enabled: !!userId,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error">
          <AlertIcon />
          User not found or error loading profile.
        </Alert>
      </Container>
    );
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'seller':
        return 'green';
      case 'buyer':
        return 'blue';
      case 'both':
        return 'purple';
      case 'admin':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getVerificationStatus = () => {
    if (user.user_type === 'buyer') return 'Not Required';
    if (!user.account_approved) return 'Pending';
    if (user.verification_status === 'verified') return 'Verified';
    return 'Unverified';
  };

  const getVerificationColor = () => {
    if (user.user_type === 'buyer') return 'gray';
    if (!user.account_approved) return 'yellow';
    if (user.verification_status === 'verified') return 'green';
    return 'red';
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          {/* Back Button */}
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            size="sm"
            alignSelf="flex-start"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          {/* Profile Header */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Left side - Avatar and basic info */}
                <VStack spacing={4} align="center">
                  <Avatar
                    size="2xl"
                    name={user.first_name + ' ' + user.last_name}
                    src={user.profile_image}
                  />
                  <VStack spacing={2} align="center">
                    <Heading size="lg" textAlign="center">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.username
                      }
                    </Heading>
                    <HStack spacing={2}>
                      <Badge colorScheme={getUserTypeColor(user.user_type)} size="sm">
                        {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                      </Badge>
                      {(user.user_type === 'seller' || user.user_type === 'both') && (
                        <Badge colorScheme={getVerificationColor()} size="sm">
                          {getVerificationStatus()}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </VStack>

                {/* Right side - Details */}
                <VStack spacing={4} align="start">
                  <VStack spacing={3} align="start" w="full">
                    <HStack spacing={2} color="gray.600">
                      <StarIcon />
                      <Text fontSize="sm">
                        {user.average_rating && Number(user.average_rating) > 0 
                          ? Number(user.average_rating).toFixed(1) 
                          : 'No ratings'} ({user.total_ratings || 0} reviews)
                      </Text>
                    </HStack>
                    
                    <HStack spacing={2} color="gray.600">
                      <CalendarIcon />
                      <Text fontSize="sm">
                        Member since {new Date(user.date_joined || user.created_at).toLocaleDateString()}
                      </Text>
                    </HStack>

                    {user.city && user.country && (
                      <Text fontSize="sm" color="gray.600">
                        📍 {user.city}, {user.country}
                      </Text>
                    )}

                    {user.bio && (
                      <>
                        <Divider />
                        <Text fontSize="sm" color="gray.700">
                          {user.bio}
                        </Text>
                      </>
                    )}
                  </VStack>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* User Ratings Section */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <Heading size="md" mb={4}>User Reviews</Heading>
              <UserRatingsDisplay userId={user.id} />
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default UserProfilePage;
