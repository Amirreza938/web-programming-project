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
  Image,
  IconButton,
  useToast,
  SimpleGrid,
  Checkbox,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

type ProductFormData = {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  original_price: string;
  brand: string;
  model: string;
  year: string;
  location: string;
  city: string;
  country: string;
  shipping_cost: string;
  shipping_options: string[];
  is_negotiable: boolean;
};

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  // State
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    original_price: '',
    brand: '',
    model: '',
    year: '',
    location: '',
    city: '',
    country: '',
    shipping_cost: '',
    shipping_options: [],
    is_negotiable: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProductMutation = useMutation({
    mutationFn: (data: FormData) => apiService.createProduct(data),
    onSuccess: () => {
      toast({
        title: 'Product created successfully!',
        description: 'Your product has been listed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
      toast({
        title: 'Error creating product',
        description: error.response?.data
          ? JSON.stringify(error.response.data)
          : 'Please try again.',
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 5 images.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.city || !formData.country || !formData.shipping_cost || !formData.shipping_options.length) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Only include fields expected by backend
      const backendFields = [
        'category', 'title', 'description', 'condition', 'brand', 'model',
        'price', 'original_price', 'is_negotiable', 'location', 'city',
        'country', 'latitude', 'longitude', 'shipping_options', 'shipping_cost'
      ];
      backendFields.forEach((key) => {
        const value = (formData as any)[key];
        if (value !== '' && value !== undefined) {
          if (key === 'shipping_options' && Array.isArray(value)) {
            formDataToSend.append('shipping_options', JSON.stringify(value));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      // Add images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await createProductMutation.mutateAsync(formDataToSend);
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return <LoadingSpinner />;
  }

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_repair', label: 'Needs Repair' },
  ];

  const shippingOptions = [
    { value: 'pickup', label: 'Local Pickup' },
    { value: 'delivery', label: 'Local Delivery' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'negotiable', label: 'Negotiable' },
  ];

  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'negotiable', label: 'Negotiable' },
  ];

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="800px">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="brand.500">
              Create New Listing
            </Heading>
            <Text color="gray.600">
              List your item for sale and reach potential buyers
            </Text>
          </VStack>

          {/* Form */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {/* Basic Information */}
                  <VStack spacing={4} align="stretch" w="full">
                    <Heading as="h3" size="md">
                      Basic Information
                    </Heading>
                    
                    <FormControl isRequired>
                      <FormLabel>Title</FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter product title"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your product in detail"
                        rows={4}
                      />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Category</FormLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          placeholder="Select category"
                        >
                          {categories?.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Condition</FormLabel>
                        <Select
                          name="condition"
                          value={formData.condition}
                          onChange={handleInputChange}
                          placeholder="Select condition"
                        >
                          {conditionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>

                  <Divider />

                  {/* Pricing */}
                  <VStack spacing={4} align="stretch" w="full">
                    <Heading as="h3" size="md">
                      Pricing
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Price ($)</FormLabel>
                        <Input
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Original Price ($)</FormLabel>
                        <Input
                          name="original_price"
                          type="number"
                          value={formData.original_price}
                          onChange={handleInputChange}
                          placeholder="Original price (optional)"
                          min="0"
                          step="0.01"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <Checkbox
                      name="is_negotiable"
                      isChecked={formData.is_negotiable}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_negotiable: e.target.checked }))}
                    >
                      Price is negotiable
                    </Checkbox>
                  </VStack>

                  <Divider />

                  {/* Product Details */}
                  <VStack spacing={4} align="stretch" w="full">
                    <Heading as="h3" size="md">
                      Product Details
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl>
                        <FormLabel>Brand</FormLabel>
                        <Input
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          placeholder="Brand name"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Model</FormLabel>
                        <Input
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          placeholder="Model name"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl>
                        <FormLabel>Year</FormLabel>
                        <Input
                          name="year"
                          type="number"
                          value={formData.year}
                          onChange={handleInputChange}
                          placeholder="Year"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Location</FormLabel>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="City, State"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>

                  <Divider />

                  {/* Shipping & Payment */}
                  <VStack spacing={4} align="stretch" w="full">
                    <Heading as="h3" size="md">
                      Shipping & Payment
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <FormControl isRequired>
                        <FormLabel>City</FormLabel>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Country</FormLabel>
                        <Input
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Country"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Shipping Cost ($)</FormLabel>
                        <Input
                          name="shipping_cost"
                          type="number"
                          value={formData.shipping_cost}
                          onChange={handleInputChange}
                          placeholder="Shipping cost"
                          min="0"
                          step="0.01"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Shipping Options</FormLabel>
                        <VStack align="start" spacing={2}>
                          {shippingOptions.map((option) => (
                            <Checkbox
                              key={option.value}
                              isChecked={formData.shipping_options.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    shipping_options: [...prev.shipping_options, option.value]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    shipping_options: prev.shipping_options.filter(opt => opt !== option.value)
                                  }));
                                }
                              }}
                            >
                              {option.label}
                            </Checkbox>
                          ))}
                        </VStack>
                      </FormControl>
                    </SimpleGrid>

                  </VStack>

                  <Divider />

                  {/* Images */}
                  <VStack spacing={4} align="stretch" w="full">
                    <Heading as="h3" size="md">
                      Product Images
                    </Heading>
                    
                    <Text fontSize="sm" color="gray.600">
                      Upload up to 5 images. First image will be the main image.
                    </Text>

                    {/* Image Upload */}
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      cursor="pointer"
                      _hover={{ borderColor: 'brand.500' }}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <VStack spacing={2} cursor="pointer">
                          <AddIcon boxSize={8} color="gray.400" />
                          <Text color="gray.600">
                            Click to upload images
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            PNG, JPG up to 5MB each
                          </Text>
                        </VStack>
                      </label>
                    </Box>

                    {/* Image Previews */}
                    {imageUrls.length > 0 && (
                      <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                        {imageUrls.map((url, index) => (
                          <Box key={index} position="relative">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              w="full"
                              h="120px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                            <IconButton
                              aria-label="Remove image"
                              icon={<CloseIcon />}
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={1}
                              right={1}
                              onClick={() => removeImage(index)}
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    )}
                  </VStack>

                  {/* Submit Button */}
                  <VStack spacing={4} w="full">
                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      isLoading={isSubmitting}
                      loadingText="Creating listing..."
                    >
                      Create Listing
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      w="full"
                    >
                      Cancel
                    </Button>
                  </VStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateProductPage; 