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
  Image,
  Badge,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, AttachmentIcon } from '@chakra-ui/icons';
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
  const [idCardFiles, setIdCardFiles] = useState<File[]>([]);
  const [idCardPreviews, setIdCardPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setIdCardFiles(fileArray);
      
      // Create previews
      const previews: string[] = [];
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            if (previews.length === fileArray.length) {
              setIdCardPreviews(previews);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const isFormValid = () => {
    // Check all required fields
    const requiredFields = [
      'username', 'email', 'password', 'confirmPassword', 
      'firstName', 'lastName', 'phone', 'address', 
      'city', 'state', 'zipCode', 'country'
    ];
    
    const hasAllRequiredFields = requiredFields.every(field => 
      formData[field as keyof typeof formData].trim() !== ''
    );
    
    // Check terms agreement
    if (!agreedToTerms) return false;
    
    // Check password match
    if (formData.password !== formData.confirmPassword) return false;
    
    // Check password length
    if (formData.password.length < 8) return false;
    
    // Check ID card requirement for seller/both
    if ((formData.userType === 'seller' || formData.userType === 'both')) {
      if (!idCardFiles || idCardFiles.length < 2) return false;
    }
    
    return hasAllRequiredFields;
  };

  const validateForm = () => {
    // Check all required fields
    const requiredFields = [
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'password', label: 'Password' },
      { key: 'confirmPassword', label: 'Confirm Password' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'zipCode', label: 'ZIP Code' },
      { key: 'country', label: 'Country' },
    ];
    
    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData].trim()) {
        setError(`${field.label} is required`);
        return false;
      }
    }
    
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
    
    // Check ID card requirement for seller/both
    if ((formData.userType === 'seller' || formData.userType === 'both')) {
      if (!idCardFiles || idCardFiles.length < 2) {
        setError('Please upload both front and back of your ID card for seller accounts');
        return false;
      }
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
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('confirmPassword', formData.confirmPassword);
      submitData.append('first_name', formData.firstName);
      submitData.append('last_name', formData.lastName);
      submitData.append('phone_number', formData.phone);
      submitData.append('user_type', formData.userType);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('country', formData.country);
      submitData.append('postal_code', formData.zipCode);
      
      // Add ID card files if present (must be exactly 2 files for seller/both)
      if (idCardFiles && idCardFiles.length >= 2) {
        console.log('Adding ID card files:', idCardFiles[0], idCardFiles[1]);
        submitData.append('id_card_front', idCardFiles[0]);
        submitData.append('id_card_back', idCardFiles[1]);
      } else if (formData.userType === 'seller' || formData.userType === 'both') {
        throw new Error('ID card files are required for seller accounts');
      }
      
      // Debug: Check if FormData has files
      console.log('FormData has id_card_front:', submitData.has('id_card_front'));
      console.log('FormData has id_card_back:', submitData.has('id_card_back'));
      
      await register(submitData);
      
      if (formData.userType === 'seller' || formData.userType === 'both') {
        toast({
          title: 'Registration successful!',
          description: 'Your account has been created and is pending admin approval. You will be notified once approved.',
          status: 'success',
          duration: 7000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Registration successful!',
          description: 'Welcome to SecondHand! You can now start browsing and buying products.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      // Extract user-friendly error message
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: 'Registration failed',
        description: errorMessage,
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

                  {/* ID Card Upload - Only for Sellers */}
                  {(formData.userType === 'seller' || formData.userType === 'both') && (
                    <VStack spacing={4} w="full">
                      <Heading as="h3" size="md" alignSelf="flex-start">
                        Identity Verification
                        <Badge ml={2} colorScheme="red">Required</Badge>
                      </Heading>
                      
                      <Alert status="info">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">
                            As a seller, you need to upload your ID card for verification.
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Your account will be pending admin approval until verification is complete.
                          </Text>
                        </VStack>
                      </Alert>

                      <FormControl isRequired>
                        <FormLabel>
                          ID Card Upload
                          <Text fontSize="sm" color="gray.600" fontWeight="normal">
                            Upload clear photos of your government-issued ID card (front and back)
                          </Text>
                        </FormLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleIdCardChange}
                          display="none"
                          id="id-card-upload"
                        />
                        <Button
                          as="label"
                          htmlFor="id-card-upload"
                          leftIcon={<AttachmentIcon />}
                          variant="outline"
                          cursor="pointer"
                          w="full"
                        >
                          {idCardFiles?.length ? `${idCardFiles.length} file(s) selected` : 'Choose ID card images'}
                        </Button>
                      </FormControl>

                      {/* ID Card Previews */}
                      {idCardPreviews.length > 0 && (
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                          {idCardPreviews.map((preview, index) => (
                            <Box key={index} borderWidth={1} borderRadius="md" overflow="hidden">
                              <Image
                                src={preview}
                                alt={`ID Card ${index + 1}`}
                                maxH="200px"
                                w="full"
                                objectFit="cover"
                              />
                              <Text fontSize="sm" p={2} textAlign="center" bg="gray.50">
                                ID Card {index + 1}
                              </Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      )}
                    </VStack>
                  )}

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
                      isDisabled={!isFormValid()}
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