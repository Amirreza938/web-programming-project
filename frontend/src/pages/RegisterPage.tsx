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
  InputGroup,
  InputRightElement,
  Select,
  VStack,
  HStack,
  Link,
  Alert,
  AlertIcon,
  useToast,
  Card,
  CardBody,
  Divider,
  Checkbox,
  CheckboxGroup,
  Textarea,
  SimpleGrid,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'buyer',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(formData);
      toast({
        title: 'Registration successful!',
        description: 'Welcome to SecondHand! Please check your email to verify your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        'Registration failed. Please try again.'
      );
      toast({
        title: 'Registration failed',
        description: err.response?.data?.message || JSON.stringify(err.response?.data) || 'Please check your information and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="2xl">
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              Create Your Account
            </Heading>
            <Text color="gray.600">
              Join thousands of users buying and selling second-hand items
            </Text>
          </VStack>

          {/* Registration Form */}
          <Card w="full" shadow="md">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {error && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  {/* Account Information */}
                  <VStack spacing={4} w="full">
                    <Heading as="h3" size="md" alignSelf="flex-start">
                      Account Information
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Choose a username"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                          <Input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                          />
                          <InputRightElement>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Confirm Password</FormLabel>
                        <InputGroup>
                          <Input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                          />
                          <InputRightElement>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>

                  {/* Personal Information */}
                  <VStack spacing={4} w="full">
                    <Heading as="h3" size="md" alignSelf="flex-start">
                      Personal Information
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          name="userType"
                          value={formData.userType}
                          onChange={handleChange}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="both">Both (Buy & Sell)</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>

                  {/* Address Information */}
                  <VStack spacing={4} w="full">
                    <Heading as="h3" size="md" alignSelf="flex-start">
                      Address Information (Optional)
                    </Heading>
                    
                    <FormControl>
                      <FormLabel>Street Address</FormLabel>
                      <Textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your street address"
                        rows={2}
                      />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} w="full">
                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="City"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>State/Province</FormLabel>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="State"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>ZIP/Postal Code</FormLabel>
                        <Input
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="ZIP Code"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel>Country</FormLabel>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                      />
                    </FormControl>
                  </VStack>

                  {/* Terms and Conditions */}
                  <VStack spacing={4} w="full">
                    <Checkbox
                      isChecked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      colorScheme="brand"
                    >
                      I agree to the{' '}
                      <Link color="brand.500" href="/terms" isExternal>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link color="brand.500" href="/privacy" isExternal>
                        Privacy Policy
                      </Link>
                    </Checkbox>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      isLoading={isLoading}
                      loadingText="Creating account..."
                    >
                      Create Account
                    </Button>
                  </VStack>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Footer */}
          <VStack spacing={4}>
            <HStack>
              <Text color="gray.600">Already have an account?</Text>
              <Link as={RouterLink} to="/login" color="brand.500" fontWeight="semibold">
                Sign In
              </Link>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default RegisterPage;