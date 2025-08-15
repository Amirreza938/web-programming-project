import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

interface ProductReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productTitle: string;
}

const REPORT_TYPES = [
  { value: 'irrelevant', label: 'Irrelevant Product' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'fake', label: 'Fake Product' },
  { value: 'fraud', label: 'Fraud/Scam' },
  { value: 'duplicate', label: 'Duplicate Listing' },
  { value: 'other', label: 'Other' },
];

const ProductReportModal: React.FC<ProductReportModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
}) => {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();

  const reportMutation = useMutation({
    mutationFn: (data: { report_type: string; description: string }) =>
      apiService.reportProduct(productId, data),
    onSuccess: () => {
      toast({
        title: 'Report submitted',
        description: 'Thank you for your report. We will review it shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
      onClose();
      setReportType('');
      setDescription('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error submitting report',
        description: error.response?.data?.error || 'Failed to submit report',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = () => {
    if (!reportType) {
      toast({
        title: 'Report type required',
        description: 'Please select a report type',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please provide a description of the issue',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    reportMutation.mutate({
      report_type: reportType,
      description: description.trim(),
    });
  };

  const handleClose = () => {
    if (!reportMutation.isPending) {
      onClose();
      setReportType('');
      setDescription('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Report Product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Reporting: <strong>{productTitle}</strong>
            </Text>
            
            <FormControl isRequired>
              <FormLabel>Report Type</FormLabel>
              <Select
                placeholder="Select reason for reporting"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                isDisabled={reportMutation.isPending}
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Please describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minH="100px"
                isDisabled={reportMutation.isPending}
                maxLength={1000}
              />
              <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                {description.length}/1000 characters
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={reportMutation.isPending}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={reportMutation.isPending}
            loadingText="Submitting..."
          >
            Submit Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductReportModal;