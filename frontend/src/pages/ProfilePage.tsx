import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Badge,
  Divider,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { EditIcon, StarIcon, CalendarIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import UserRatingsDisplay from '../components/UserRatingsDisplay';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cardBg = useColorModeValue('white', 'gray.700');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip_code: user?.zip_code || '',
    country: user?.country || '',
    bio: user?.bio || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setIsEditing(false);
      toast({
        title: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating profile',
        description: error.response?.data?.message || 'Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zip_code: user?.zip_code || '',
      country: user?.country || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1000px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              My Profile
            </Heading>
            <Text color="gray.600">
              Manage your account information and preferences
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
            {/* Profile Overview */}
            <Box gridColumn={{ lg: 'span 1' }}>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <VStack spacing={6} align="center">
                    <Avatar
                      size="2xl"
                      name={`${user.first_name} ${user.last_name}`}
                      src={user.profile_image}
                    />
                    
                    <VStack spacing={2} textAlign="center">
                      <Heading as="h2" size="lg">
                        {`${user.first_name} ${user.last_name}`}
                      </Heading>
                      <Text color="gray.600">{user.email}</Text>
                      
                      <HStack spacing={2}>
                        <Badge colorScheme="blue" variant="outline">
                          {user.user_type}
                        </Badge>
                        {user.is_verified && (
                          <Badge colorScheme="green" variant="outline">
                            Verified
                          </Badge>
                        )}
                      </HStack>
                    </VStack>

                    <Divider />

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
                    </VStack>

                    {!isEditing && (
                      <Button
                        leftIcon={<EditIcon />}
                        colorScheme="brand"
                        onClick={() => setIsEditing(true)}
                        w="full"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* Profile Form */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={6}>
                      {/* Account Type Alert */}
                      {user.user_type === 'seller' && !user.is_verified && (
                        <Alert status="warning">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">Seller Verification Required</Text>
                            <Text fontSize="sm">
                              Complete seller verification to unlock all features and build trust with buyers.
                            </Text>
                          </VStack>
                        </Alert>
                      )}

                      {/* Personal Information */}
                      <VStack spacing={4} align="stretch" w="full">
                        <Heading as="h3" size="md">
                          Personal Information
                        </Heading>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                          <FormControl isRequired>
                            <FormLabel>First Name</FormLabel>
                            <Input
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Last Name</FormLabel>
                            <Input
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                          <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Phone</FormLabel>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <FormControl>
                          <FormLabel>Bio</FormLabel>
                          <Textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                      </VStack>

                      <Divider />

                      {/* Address Information */}
                      <VStack spacing={4} align="stretch" w="full">
                        <Heading as="h3" size="md">
                          Address Information
                        </Heading>
                        
                        <FormControl>
                          <FormLabel>Street Address</FormLabel>
                          <Input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                          />
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                          <FormControl>
                            <FormLabel>City</FormLabel>
                            <Input
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>State/Province</FormLabel>
                            <Input
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>ZIP/Postal Code</FormLabel>
                            <Input
                              name="zip_code"
                              value={formData.zip_code}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <FormControl>
                          <FormLabel>Country</FormLabel>
                          <Input
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                      </VStack>

                      {/* Action Buttons */}
                      {isEditing && (
                        <VStack spacing={4}>
                          <HStack spacing={4} w="full">
                            <Button
                              type="submit"
                              colorScheme="brand"
                              flex={1}
                              isLoading={updateProfileMutation.isPending}
                              loadingText="Saving..."
                            >
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancel}
                              flex={1}
                            >
                              Cancel
                            </Button>
                          </HStack>
                        </VStack>
                      )}
                    </VStack>
                  </form>
                </CardBody>
              </Card>
            </Box>
          </SimpleGrid>

          {/* User Ratings Section */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <UserRatingsDisplay userId={user.id} />
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ProfilePage; 