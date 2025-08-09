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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Badge,
  Progress,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Image,
  Divider,
} from '@chakra-ui/react';
import {
  CheckIcon,
  WarningIcon,
  TimeIcon,
  AttachmentIcon,
} from '@chakra-ui/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SellerVerificationPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [documents, setDocuments] = useState<File[]>([]);
  const [verificationData, setVerificationData] = useState({
    businessName: '',
    businessType: '',
    taxId: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    description: '',
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const stepperBg = useColorModeValue('gray.50', 'gray.800');

  // Fetch current verification status
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['verificationStatus'],
    queryFn: () => apiService.getVerificationStatus(),
  });

  // Submit verification mutation
  const submitVerificationMutation = useMutation({
    mutationFn: (data: FormData) => apiService.submitVerification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationStatus'] });
      toast({
        title: 'Verification submitted',
        description: 'Your seller verification has been submitted for review.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Submission failed',
        description: 'Failed to submit verification. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setDocuments(Array.from(event.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.entries(verificationData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    documents.forEach((doc, index) => {
      formData.append(`document_${index}`, doc);
    });

    submitVerificationMutation.mutate(formData);
  };

  const getVerificationSteps = () => {
    const steps = [
      {
        title: 'Application',
        description: 'Submit your information',
        status: 'complete',
      },
      {
        title: 'Document Review',
        description: 'We verify your documents',
        status: verificationStatus?.status === 'pending' ? 'active' : 
                verificationStatus?.status === 'verified' ? 'complete' : 'inactive',
      },
      {
        title: 'Approval',
        description: 'Get verified seller status',
        status: verificationStatus?.status === 'verified' ? 'complete' : 'inactive',
      },
    ];

    return steps;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckIcon />;
      case 'pending':
        return <TimeIcon />;
      case 'rejected':
        return <WarningIcon />;
      default:
        return <TimeIcon />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If already verified
  if (verificationStatus?.status === 'verified') {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="800px">
          <VStack spacing={8} align="stretch">
            <VStack spacing={4} textAlign="center">
              <CheckIcon boxSize={16} color="green.500" />
              <Heading as="h1" size="xl" color="green.500">
                Verification Complete!
              </Heading>
              <Text color="gray.600">
                Congratulations! Your seller account has been verified.
              </Text>
            </VStack>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={6}>
                  <Badge colorScheme="green" fontSize="lg" p={2} borderRadius="md">
                    ✓ Verified Seller
                  </Badge>
                  
                  <VStack spacing={4} textAlign="center">
                    <Text fontSize="lg" fontWeight="semibold">
                      Your Benefits
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <VStack p={4} borderRadius="md" bg="green.50">
                        <CheckIcon color="green.500" />
                        <Text fontWeight="semibold">Trusted Badge</Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Display verified seller badge on your listings
                        </Text>
                      </VStack>
                      <VStack p={4} borderRadius="md" bg="blue.50">
                        <CheckIcon color="blue.500" />
                        <Text fontWeight="semibold">Higher Visibility</Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Your products get priority in search results
                        </Text>
                      </VStack>
                      <VStack p={4} borderRadius="md" bg="purple.50">
                        <CheckIcon color="purple.500" />
                        <Text fontWeight="semibold">Trust & Credibility</Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Buyers are more likely to purchase from verified sellers
                        </Text>
                      </VStack>
                      <VStack p={4} borderRadius="md" bg="orange.50">
                        <CheckIcon color="orange.500" />
                        <Text fontWeight="semibold">Priority Support</Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Get faster response from customer support
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>

                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Go to Dashboard
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  // If verification is pending
  if (verificationStatus?.status === 'pending') {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="800px">
          <VStack spacing={8} align="stretch">
            <VStack spacing={4} textAlign="center">
              <TimeIcon boxSize={16} color="yellow.500" />
              <Heading as="h1" size="xl" color="yellow.600">
                Verification In Progress
              </Heading>
              <Text color="gray.600">
                Your seller verification is currently being reviewed.
              </Text>
            </VStack>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={6}>
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>Review in Progress!</AlertTitle>
                    <AlertDescription>
                      Our team is reviewing your submitted documents. This usually takes 2-3 business days.
                    </AlertDescription>
                  </Alert>

                  <Box w="full" p={4} bg={stepperBg} borderRadius="md">
                    <Stepper index={1} colorScheme="yellow">
                      {getVerificationSteps().map((step, index) => (
                        <Step key={index}>
                          <StepIndicator>
                            <StepStatus
                              complete={<StepIcon />}
                              incomplete={<StepNumber />}
                              active={<StepNumber />}
                            />
                          </StepIndicator>

                          <Box flexShrink="0">
                            <StepTitle>{step.title}</StepTitle>
                            <StepDescription>{step.description}</StepDescription>
                          </Box>

                          <StepSeparator />
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  <VStack spacing={4} textAlign="center">
                    <Text fontWeight="semibold">What happens next?</Text>
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        1. Our verification team reviews your submitted documents
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        2. We may contact you if additional information is needed
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        3. You'll receive an email notification once verification is complete
                      </Text>
                    </VStack>
                  </VStack>

                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Submitted on: {new Date(verificationStatus?.submitted_at).toLocaleDateString()}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  // If verification was rejected
  if (verificationStatus?.status === 'rejected') {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="800px">
          <VStack spacing={8} align="stretch">
            <VStack spacing={4} textAlign="center">
              <WarningIcon boxSize={16} color="red.500" />
              <Heading as="h1" size="xl" color="red.500">
                Verification Rejected
              </Heading>
              <Text color="gray.600">
                Unfortunately, your seller verification was not approved.
              </Text>
            </VStack>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={6}>
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Verification Rejected</AlertTitle>
                    <AlertDescription>
                      {verificationStatus?.rejection_reason || 'Your verification was rejected. Please review the requirements and resubmit.'}
                    </AlertDescription>
                  </Alert>

                  <VStack spacing={4} textAlign="center">
                    <Text fontWeight="semibold">Common reasons for rejection:</Text>
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        • Incomplete or unclear documentation
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • Information doesn't match submitted documents
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • Documents are expired or invalid
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        • Business information cannot be verified
                      </Text>
                    </VStack>
                  </VStack>

                  <Button
                    colorScheme="brand"
                    size="lg"
                    onClick={() => window.location.reload()}
                  >
                    Reapply for Verification
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Verification form
  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="800px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              Become a Verified Seller
            </Heading>
            <Text color="gray.600">
              Get verified to build trust with buyers and increase your sales
            </Text>
          </VStack>

          {/* Benefits */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={4}>
                <Heading as="h3" size="md">Why get verified?</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                  <VStack p={4} borderRadius="md" bg="blue.50">
                    <CheckIcon color="blue.500" />
                    <Text fontWeight="semibold">Build Trust</Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Verified badge increases buyer confidence
                    </Text>
                  </VStack>
                  <VStack p={4} borderRadius="md" bg="green.50">
                    <CheckIcon color="green.500" />
                    <Text fontWeight="semibold">Higher Visibility</Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Priority placement in search results
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Verification Form */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <Heading as="h3" size="md">Verification Information</Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel>Business Name</FormLabel>
                      <Input
                        value={verificationData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="Your business name"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Business Type</FormLabel>
                      <Input
                        value={verificationData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        placeholder="e.g., Individual, LLC, Corporation"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Tax ID / Business Number</FormLabel>
                      <Input
                        value={verificationData.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                        placeholder="Tax identification number"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        value={verificationData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Business phone number"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel>Business Address</FormLabel>
                    <Textarea
                      value={verificationData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Complete business address"
                      rows={3}
                    />
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <FormControl isRequired>
                      <FormLabel>City</FormLabel>
                      <Input
                        value={verificationData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Country</FormLabel>
                      <Input
                        value={verificationData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Country"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Business Description</FormLabel>
                    <Textarea
                      value={verificationData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of your business and what you sell"
                      rows={4}
                    />
                  </FormControl>

                  <Divider />

                  <FormControl isRequired>
                    <FormLabel>Verification Documents</FormLabel>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color="gray.600">
                        Please upload the following documents:
                      </Text>
                      <VStack spacing={2} align="stretch" fontSize="sm" color="gray.600">
                        <Text>• Government-issued ID (passport, driver's license)</Text>
                        <Text>• Business registration document</Text>
                        <Text>• Tax certificate or business license</Text>
                        <Text>• Proof of address (utility bill, bank statement)</Text>
                      </VStack>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        p={1}
                      />
                      {documents.length > 0 && (
                        <VStack spacing={2} align="stretch">
                          <Text fontSize="sm" fontWeight="semibold">Selected files:</Text>
                          {documents.map((doc, index) => (
                            <Text key={index} fontSize="sm" color="gray.600">
                              {doc.name}
                            </Text>
                          ))}
                        </VStack>
                      )}
                    </VStack>
                  </FormControl>

                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      All information will be kept confidential and used only for verification purposes. 
                      The verification process typically takes 2-3 business days.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    isLoading={submitVerificationMutation.isPending}
                    loadingText="Submitting..."
                    isDisabled={
                      !verificationData.businessName ||
                      !verificationData.businessType ||
                      !verificationData.taxId ||
                      !verificationData.address ||
                      !verificationData.city ||
                      !verificationData.country ||
                      !verificationData.phone ||
                      documents.length === 0
                    }
                  >
                    Submit for Verification
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default SellerVerificationPage;
