import React from 'react';
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { apiService, ProductReport } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyReportsPage: React.FC = () => {
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['myReports'],
    queryFn: () => apiService.getMyReports(),
  });

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: 'yellow',
      reviewed: 'blue',
      resolved: 'green',
      dismissed: 'gray',
    };
    return colorMap[status] || 'gray';
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const reports = reportsData?.results || [];

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            My Reports
          </Heading>
          <Text color="gray.600">
            View the status of your submitted product reports.
          </Text>
        </Box>

        {reports.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>No reports found!</AlertTitle>
              <AlertDescription>
                You haven't submitted any product reports yet. You can report products that violate our community guidelines.
              </AlertDescription>
            </Box>
          </Alert>
        ) : (
          <>
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="semibold">
                {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
              </Text>
            </HStack>

            <Card>
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th>Report Type</Th>
                      <Th>Status</Th>
                      <Th>Submitted</Th>
                      <Th>Description</Th>
                      <Th>Admin Notes</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reports.map((report: ProductReport) => (
                      <Tr key={report.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                              {report.product.title}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              by {report.product.seller}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getReportTypeColor(report.report_type)} size="sm">
                            {report.report_type}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(report.status)} size="sm">
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {formatDate(report.created_at)}
                          </Text>
                        </Td>
                        <Td maxW="250px">
                          <Text fontSize="sm" noOfLines={3}>
                            {report.description}
                          </Text>
                        </Td>
                        <Td maxW="200px">
                          {report.admin_notes ? (
                            <Text fontSize="sm" color="gray.600" noOfLines={3}>
                              {report.admin_notes}
                            </Text>
                          ) : (
                            <Text fontSize="sm" color="gray.400" fontStyle="italic">
                              No admin notes
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <Button
                            as={RouterLink}
                            to={`/products/${report.product.id}`}
                            size="sm"
                            variant="outline"
                            rightIcon={<ExternalLinkIcon />}
                          >
                            View Product
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            {/* Status Legend */}
            <Card bg="gray.50">
              <CardBody>
                <Text fontWeight="medium" mb={3}>
                  Status Legend:
                </Text>
                <HStack spacing={6} wrap="wrap">
                  <HStack>
                    <Badge colorScheme="yellow" size="sm">Pending</Badge>
                    <Text fontSize="sm">Under review by admin</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="blue" size="sm">Reviewed</Badge>
                    <Text fontSize="sm">Admin has reviewed the report</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="green" size="sm">Resolved</Badge>
                    <Text fontSize="sm">Issue has been addressed</Text>
                  </HStack>
                  <HStack>
                    <Badge colorScheme="gray" size="sm">Dismissed</Badge>
                    <Text fontSize="sm">Report was not actionable</Text>
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default MyReportsPage;