import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Badge,
  Button,
  Card,
  CardBody,
  Progress,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ApprovalPendingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'verified':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your identity documents are being reviewed by our admin team.';
      case 'verified':
        return 'Your identity has been verified!';
      case 'rejected':
        return 'Your verification request was rejected. Please contact support.';
      default:
        return 'Unknown verification status.';
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      <Box maxW="md" mx="auto" px={4}>
        <VStack spacing={6}>
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="lg" color="brand.500">
              Account Approval Pending
            </Heading>
            <Text color="gray.600">
              Your seller account is being reviewed
            </Text>
          </VStack>

          <Card w="full" shadow="md">
            <CardBody p={6}>
              <VStack spacing={6}>
                {/* User Info */}
                <VStack spacing={2} textAlign="center">
                  <Text fontSize="lg" fontWeight="semibold">
                    Welcome, {user?.first_name} {user?.last_name}!
                  </Text>
                  <Badge colorScheme="blue" size="lg">
                    {user?.user_type === 'both' ? 'Buyer & Seller' : 'Seller'} Account
                  </Badge>
                </VStack>

                <Divider />

                {/* Approval Status */}
                <VStack spacing={4} w="full">
                  <Heading as="h3" size="md">
                    Verification Status
                  </Heading>
                  
                  <Alert status={user?.verification_status === 'pending' ? 'warning' : 'info'}>
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">
                        Status: {' '}
                        <Badge colorScheme={getStatusColor(user?.verification_status || '')}>
                          {user?.verification_status || 'Unknown'}
                        </Badge>
                      </Text>
                      <Text fontSize="sm">
                        {getStatusMessage(user?.verification_status || '')}
                      </Text>
                    </VStack>
                  </Alert>

                  {user?.verification_status === 'pending' && (
                    <Box w="full">
                      <Text fontSize="sm" mb={2} color="gray.600">
                        Verification Progress
                      </Text>
                      <Progress value={50} colorScheme="brand" />
                      <Text fontSize="xs" mt={1} color="gray.500" textAlign="center">
                        Documents submitted • Awaiting review
                      </Text>
                    </Box>
                  )}
                </VStack>

                <Divider />

                {/* Account Status */}
                <VStack spacing={4} w="full">
                  <Heading as="h3" size="md">
                    Account Status
                  </Heading>
                  
                  <Alert status={user?.account_approved ? 'success' : 'warning'}>
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">
                        Account: {' '}
                        <Badge colorScheme={user?.account_approved ? 'green' : 'yellow'}>
                          {user?.account_approved ? 'Approved' : 'Pending Approval'}
                        </Badge>
                      </Text>
                      <Text fontSize="sm">
                        {user?.account_approved 
                          ? 'Your account has been approved and you can start selling!'
                          : 'Your account is pending admin approval. Once approved, you will be able to access all seller features.'
                        }
                      </Text>
                    </VStack>
                  </Alert>
                </VStack>

                <Divider />

                {/* Available Features */}
                <VStack spacing={4} w="full">
                  <Heading as="h3" size="md">
                    Available Features
                  </Heading>
                  
                  <VStack spacing={2} w="full" align="start">
                    <Text fontSize="sm" color="green.600">
                      ✓ Browse and view products
                    </Text>
                    {user?.can_buy && (
                      <Text fontSize="sm" color="green.600">
                        ✓ Purchase products
                      </Text>
                    )}
                    <Text fontSize="sm" color="gray.500">
                      ⏳ Create and sell products (after approval)
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      ⏳ Access seller dashboard (after approval)
                    </Text>
                  </VStack>
                </VStack>

                {/* Actions */}
                <VStack spacing={3} w="full">
                  {user?.can_buy && (
                    <Button
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      onClick={() => navigate('/products')}
                    >
                      Browse Products
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="lg"
                    w="full"
                    onClick={() => navigate('/profile')}
                  >
                    View Profile
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    color="gray.600"
                  >
                    Logout
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <VStack spacing={2} textAlign="center">
            <Text fontSize="sm" color="gray.600">
              Need help? Contact our support team at{' '}
              <Text as="span" color="brand.500" fontWeight="semibold">
                support@secondhand.com
              </Text>
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default ApprovalPendingPage;
