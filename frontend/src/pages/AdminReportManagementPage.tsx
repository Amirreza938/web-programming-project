import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  Select,
  ButtonGroup,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ViewIcon, WarningIcon } from '@chakra-ui/icons';
import { apiService, PendingProductReport } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminReportManagementPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState<PendingProductReport | null>(null);
  const [actionType, setActionType] = useState<'review' | 'resolve' | 'dismiss'>('review');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch pending reports
  const { data: pendingReports, isLoading } = useQuery({
    queryKey: ['pendingReports'],
    queryFn: () => apiService.getPendingReports(),
  });

  // Update report status mutation
  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, action, notes }: { reportId: number; action: 'review' | 'resolve' | 'dismiss'; notes?: string }) =>
      apiService.updateReportStatus(reportId, action, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingReports'] });
      const actionPastTense = variables.action === 'review' ? 'reviewed' : variables.action === 'resolve' ? 'resolved' : 'dismissed';
      toast({
        title: `Report ${actionPastTense}`,
        description: `The report has been successfully ${actionPastTense}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating report',
        description: error.response?.data?.error || 'Failed to update report status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleReportAction = (report: PendingProductReport, action: 'review' | 'resolve' | 'dismiss') => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNotes('');
    onOpen();
  };

  const handleSubmitAction = () => {
    if (!selectedReport) return;

    updateReportMutation.mutate({
      reportId: selectedReport.id,
      action: actionType,
      notes: adminNotes.trim() || undefined,
    });
  };

  const getReportTypeColor = (reportType: string) => {
    const colorMap: { [key: string]: string } = {
      'Irrelevant Product': 'blue',
      'Harassment': 'red',
      'Spam': 'orange',
      'Inappropriate Content': 'purple',
      'Fake Product': 'red',
      'Fraud/Scam': 'red',
      'Duplicate Listing': 'yellow',
      'Other': 'gray',
    };
    return colorMap[reportType] || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionButtonProps = (action: 'review' | 'resolve' | 'dismiss') => {
    const props = {
      review: { colorScheme: 'blue', label: 'Mark as Reviewed' },
      resolve: { colorScheme: 'green', label: 'Resolve' },
      dismiss: { colorScheme: 'gray', label: 'Dismiss' },
    };
    return props[action];
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Product Report Management
          </Heading>
          <Text color="gray.600">
            Review and manage product reports submitted by users.
          </Text>
        </Box>

        {!pendingReports || pendingReports.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>No pending reports!</AlertTitle>
              <AlertDescription>
                All reports have been reviewed. New reports will appear here.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <Flex align="center" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                {pendingReports.length} report{pendingReports.length !== 1 ? 's' : ''} pending review
              </Text>
            </Flex>

            <Card>
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th>Report Type</Th>
                      <Th>Reporter</Th>
                      <Th>Submitted</Th>
                      <Th>Description</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingReports.map((report) => (
                      <Tr key={report.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                              {report.product_title}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getReportTypeColor(report.report_type)} size="sm">
                            {report.report_type}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{report.reporter}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(report.created_at)}
                          </Text>
                        </Td>
                        <Td maxW="200px">
                          <Text fontSize="sm" noOfLines={3}>
                            {report.description}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <ButtonGroup size="sm" variant="outline">
                              <Button
                                colorScheme="blue"
                                onClick={() => handleReportAction(report, 'review')}
                              >
                                Review
                              </Button>
                              <Button
                                colorScheme="green"
                                onClick={() => handleReportAction(report, 'resolve')}
                              >
                                Resolve
                              </Button>
                              <Button
                                colorScheme="gray"
                                onClick={() => handleReportAction(report, 'dismiss')}
                              >
                                Dismiss
                              </Button>
                            </ButtonGroup>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>

      {/* Action Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionType === 'review' && 'Review Report'}
            {actionType === 'resolve' && 'Resolve Report'}
            {actionType === 'dismiss' && 'Dismiss Report'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <VStack spacing={2} align="stretch" p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">
                  <strong>Product:</strong> {selectedReport?.product_title}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Report Type:</strong> {selectedReport?.report_type}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Reporter:</strong> {selectedReport?.reporter}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  <strong>Description:</strong> {selectedReport?.description}
                </Text>
              </VStack>

              <Box>
                <Text mb={2} fontWeight="medium">
                  Admin Notes (Optional)
                </Text>
                <Textarea
                  placeholder={`Add notes about how you ${actionType === 'review' ? 'reviewed' : actionType === 'resolve' ? 'resolved' : 'dismissed'} this report...`}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  minH="100px"
                />
              </Box>

              {actionType === 'resolve' && (
                <Alert status="info" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Resolving this report indicates that appropriate action has been taken regarding the reported product.
                  </Text>
                </Alert>
              )}

              {actionType === 'dismiss' && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Dismissing this report indicates that no action is needed and the report is considered invalid.
                  </Text>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              {...getActionButtonProps(actionType)}
              onClick={handleSubmitAction}
              isLoading={updateReportMutation.isPending}
              loadingText="Processing..."
            >
              {getActionButtonProps(actionType).label}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminReportManagementPage;