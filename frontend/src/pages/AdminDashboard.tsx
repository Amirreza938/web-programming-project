import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Badge,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { apiService, AdminDashboardStats, VerificationRequest, User } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch admin dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => apiService.getAdminDashboard(),
  });

  // Fetch verification requests
  const { data: verificationRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['verificationRequests'],
    queryFn: () => apiService.getVerificationRequests(),
  });

  // Fetch pending users
  const { data: pendingUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: () => apiService.getPendingUsers(),
  });

  // Verification request update mutation
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status, admin_notes }: { id: number; status: string; admin_notes?: string }) =>
      apiService.updateVerificationRequest(id, { status, admin_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      toast({
        title: 'Verification updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error updating verification',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // User approval mutations
  const approveUserMutation = useMutation({
    mutationFn: (userId: number) => apiService.approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      toast({
        title: 'User approved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason?: string }) =>
      apiService.rejectUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      toast({
        title: 'User rejected',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleViewRequest = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    onOpen();
  };

  const handleApproveRequest = () => {
    if (selectedRequest) {
      updateRequestMutation.mutate({
        id: selectedRequest.id,
        status: 'approved',
        admin_notes: adminNotes,
      });
    }
  };

  const handleRejectRequest = () => {
    if (selectedRequest) {
      updateRequestMutation.mutate({
        id: selectedRequest.id,
        status: 'rejected',
        admin_notes: adminNotes,
      });
    }
  };

  if (statsLoading || requestsLoading || usersLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Admin Dashboard
            </Heading>
            <Text color="gray.600">
              Manage users, verifications, and system overview
            </Text>
          </Box>

          {/* Stats Cards */}
          {stats && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Pending Verifications</StatLabel>
                    <StatNumber color="orange.500">{stats.pending_verifications}</StatNumber>
                    <StatHelpText>Awaiting review</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Users</StatLabel>
                    <StatNumber>{stats.total_users}</StatNumber>
                    <StatHelpText>Registered users</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Verified Sellers</StatLabel>
                    <StatNumber color="green.500">{stats.verified_sellers}</StatNumber>
                    <StatHelpText>Out of {stats.total_sellers} sellers</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Buyers</StatLabel>
                    <StatNumber color="blue.500">{stats.total_buyers}</StatNumber>
                    <StatHelpText>Active buyers</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <Heading size="md">Product & Report Management</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Button
                  as={RouterLink}
                  to="/admin/products/verification"
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<CheckIcon />}
                >
                  Product Verification
                </Button>
                <Button
                  as={RouterLink}
                  to="/admin/reports/management"
                  colorScheme="orange"
                  size="lg"
                  leftIcon={<WarningIcon />}
                >
                  Report Management
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Tabs for different sections */}
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Verification Requests</Tab>
              <Tab>Pending Users</Tab>
            </TabList>

            <TabPanels>
              {/* Verification Requests Tab */}
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">ID Card Verification Requests</Heading>
                  </CardHeader>
                  <CardBody>
                    {verificationRequests && verificationRequests.length > 0 ? (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>User</Th>
                            <Th>Type</Th>
                            <Th>Status</Th>
                            <Th>Submitted</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {verificationRequests.map((request) => (
                            <Tr key={request.id}>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="semibold">
                                    {request.user_details.username}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {request.user_details.email}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Badge colorScheme="blue">
                                  {request.user_details.user_type}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    request.status === 'approved'
                                      ? 'green'
                                      : request.status === 'rejected'
                                      ? 'red'
                                      : 'yellow'
                                  }
                                >
                                  {request.status}
                                </Badge>
                              </Td>
                              <Td>{new Date(request.created_at).toLocaleDateString()}</Td>
                              <Td>
                                <Button
                                  size="sm"
                                  onClick={() => handleViewRequest(request)}
                                >
                                  Review
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No verification requests found
                      </Text>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Pending Users Tab */}
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">Users Pending Approval</Heading>
                  </CardHeader>
                  <CardBody>
                    {pendingUsers && pendingUsers.length > 0 ? (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>User</Th>
                            <Th>Type</Th>
                            <Th>Verification Status</Th>
                            <Th>Registered</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {pendingUsers.map((user) => (
                            <Tr key={user.id}>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="semibold">{user.username}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {user.email}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Badge colorScheme="blue">{user.user_type}</Badge>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    user.verification_status === 'verified'
                                      ? 'green'
                                      : user.verification_status === 'rejected'
                                      ? 'red'
                                      : 'yellow'
                                  }
                                >
                                  {user.verification_status}
                                </Badge>
                              </Td>
                              <Td>{new Date(user.created_at).toLocaleDateString()}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    onClick={() => approveUserMutation.mutate(user.id)}
                                    isLoading={approveUserMutation.isPending}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() =>
                                      rejectUserMutation.mutate({ userId: user.id })
                                    }
                                    isLoading={rejectUserMutation.isPending}
                                  >
                                    Reject
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No pending users found
                      </Text>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>

        {/* Verification Request Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Review Verification Request</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedRequest && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold">User: {selectedRequest.user_details.username}</Text>
                    <Text>Email: {selectedRequest.user_details.email}</Text>
                    <Text>Type: {selectedRequest.user_details.user_type}</Text>
                  </Box>

                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>ID Card Front</Text>
                      <Image
                        src={selectedRequest.id_card_front}
                        alt="ID Front"
                        maxH="200px"
                        objectFit="contain"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                      />
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>ID Card Back</Text>
                      <Image
                        src={selectedRequest.id_card_back}
                        alt="ID Back"
                        maxH="200px"
                        objectFit="contain"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                      />
                    </Box>
                  </SimpleGrid>

                  {selectedRequest.notes && (
                    <Box>
                      <Text fontWeight="semibold">User Notes:</Text>
                      <Text>{selectedRequest.notes}</Text>
                    </Box>
                  )}

                  <Box>
                    <Text fontWeight="semibold" mb={2}>Admin Notes:</Text>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add your review notes..."
                      rows={3}
                    />
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  colorScheme="red"
                  onClick={handleRejectRequest}
                  isLoading={updateRequestMutation.isPending}
                >
                  Reject
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleApproveRequest}
                  isLoading={updateRequestMutation.isPending}
                >
                  Approve
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
