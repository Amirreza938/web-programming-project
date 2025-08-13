import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Card,
  CardBody,
  Image,
  Badge,
  Flex,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
  Divider,
  useColorModeValue,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react';
import {
  SearchIcon,
  CloseIcon,
  StarIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  // URL Parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '0';
  const maxPrice = searchParams.get('maxPrice') || '10000';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  // Local State
  const [localSearch, setLocalSearch] = useState(search);
  const [localCategory, setLocalCategory] = useState(category);
  const [localCondition, setLocalCondition] = useState(condition);
  const [localPriceRange, setLocalPriceRange] = useState([parseInt(minPrice), parseInt(maxPrice)]);
  const [localSortBy, setLocalSortBy] = useState(sortBy);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  // Ensure categories is always an array
  const categoriesArray = Array.isArray(categories) ? categories : [];

  // Convert sort value to DRF ordering parameter
  const getSortOrderingParam = (sortValue: string) => {
    const sortMapping: { [key: string]: string } = {
      'newest': '-created_at',
      'oldest': 'created_at',
      'price_low': 'price',
      'price_high': '-price',
      'popular': '-favorites_count',
      'views': '-views_count',
    };
    return sortMapping[sortValue] || '-created_at';
  };

  // Fetch products with filters
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', search, category, condition, minPrice, maxPrice, sortBy, page],
    queryFn: () => apiService.getProducts({
      search,
      category,
      condition,
      min_price: minPrice,
      max_price: maxPrice,
      ordering: getSortOrderingParam(sortBy),
      page,
    }),
    placeholderData: (previousData) => previousData,
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' },
  ];

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs_repair', label: 'Needs Repair' },
  ];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (minPrice !== '0') params.set('minPrice', minPrice);
    if (maxPrice !== '10000') params.set('maxPrice', maxPrice);
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [search, category, condition, minPrice, maxPrice, sortBy, page, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('search', localSearch.trim());
        newParams.delete('page'); // Reset to first page
        return newParams;
      });
    }
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setLocalCategory('');
    setLocalCondition('');
    setLocalPriceRange([0, 10000]);
    setLocalSortBy('newest');
    setSearchParams({});
  };

  const handlePriceChange = (values: number[]) => {
    setLocalPriceRange(values);
  };

  const applyFilters = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (localSearch) newParams.set('search', localSearch);
      if (localCategory) newParams.set('category', localCategory);
      if (localCondition) newParams.set('condition', localCondition);
      newParams.set('minPrice', localPriceRange[0].toString());
      newParams.set('maxPrice', localPriceRange[1].toString());
      newParams.set('sortBy', localSortBy);
      newParams.delete('page'); // Reset to first page
      return newParams;
    });
    onClose(); // Close mobile drawer
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      return newParams;
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    toast({
      title: 'Error loading products',
      description: 'Please try again later.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="1200px" py={8}>
        {/* Header */}
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl">
            Browse Products
          </Heading>
          <Text color="gray.600">      
            {productsData?.count || 0} products found
          </Text>
        </VStack>

        {/* Search and Filter Bar */}
        <Card mb={6} shadow="sm">
          <CardBody p={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} alignItems="center">
              {/* Search */}
              <Box>
                <form onSubmit={handleSearch}>       
                  <InputGroup>
                    <InputLeftElement>
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search products..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                    />
                  </InputGroup>
                </form>
              </Box>

              {/* Sort */}
              <Select
                value={localSortBy}
                onChange={(e) => setLocalSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={onOpen}
                display={{ base: 'flex', md: 'none' }}
              >
                Filters
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Desktop Layout */}
        <SimpleGrid columns={{ base: 1, lg: 4 }} gap={6}>
          {/* Filters Sidebar */}
          <Box display={{ base: 'none', lg: 'block' }}>
            <Card shadow="sm" position="sticky" top={4}>
              <CardBody p={6}>
                <VStack spacing={6} align="stretch">
                  <Heading as="h3" size="md">
                    Filters
                  </Heading>

                  {/* Category Filter */}
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="semibold">Category</Text>
                    <Select
                      value={localCategory}
                      onChange={(e) => setLocalCategory(e.target.value)}
                      placeholder="All Categories"
                    >
                      {categoriesArray.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </VStack>

                  {/* Condition Filter */}
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="semibold">Condition</Text>
                    <Select
                      value={localCondition}
                      onChange={(e) => setLocalCondition(e.target.value)}
                      placeholder="All Conditions"
                    >
                      {conditionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </VStack>

                  {/* Price Range Filter */}
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="semibold">Price Range</Text>
                    <RangeSlider
                      value={localPriceRange}
                      onChange={handlePriceChange}
                      min={0}
                      max={10000}
                      step={100}
                    >
                      <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} />
                      <RangeSliderThumb index={1} />
                    </RangeSlider>
                    <HStack justify="space-between">
                      <Text fontSize="sm">${localPriceRange[0]}</Text>
                      <Text fontSize="sm">${localPriceRange[1]}</Text>
                    </HStack>
                  </VStack>

                  {/* Apply Filters */}
                  <Button
                    colorScheme="brand"
                    onClick={applyFilters}
                    w="full"
                  >
                    Apply Filters
                  </Button>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    leftIcon={<CloseIcon />}
                    onClick={handleClearFilters}
                    w="full"
                  >
                    Clear Filters
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Products Grid */}
          <Box gridColumn={{ lg: 'span 3' }}>
            {isLoading ? (
              <Center py={12}>
                <Spinner size="xl" color="brand.500" />
              </Center>
            ) : (
              <VStack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
                  {productsData?.results?.map((product: any) => (
                    <Card
                      key={product.id}
                      bg={cardBg}
                      shadow="md"
                      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      cursor="pointer"
                      onClick={() => window.location.href = `/products/${product.id}`}
                    >
                      <Image
                        src={product.main_image || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.title}
                        height="200px"
                        objectFit="cover"
                      />
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <Heading as="h3" size="md" noOfLines={2}>
                            {product.title}
                          </Heading>
                          <Text fontSize="xl" fontWeight="bold" color="brand.500">
                            ${product.price}
                          </Text>
                          {product.original_price && product.original_price > product.price && (
                            <Text fontSize="sm" color="gray.500" textDecoration="line-through">
                              ${product.original_price}
                            </Text>
                          )}
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" variant="outline">
                              {product.condition}
                            </Badge>
                            {product.is_negotiable && (
                              <Badge colorScheme="green" variant="outline">
                                Negotiable
                              </Badge>
                            )}
                          </HStack>
                          <HStack spacing={2} color="gray.600">
                            <ViewIcon />
                            <Text fontSize="sm">{product.views_count} views</Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {product.location}
                          </Text>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm" color="gray.600">
                              by {product.seller_name}
                            </Text>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              aria-label="Add to favorites"
                              icon={<StarIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle favorite toggle
                              }}
                            />
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>

                {/* Pagination */}
                {productsData?.count && productsData.count > 0 && (
                  <Flex justify="center" w="full">
                    <HStack spacing={2}>
                      {Array.from({ length: Math.ceil((productsData?.count || 0) / 12) }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={page === i + 1 ? 'solid' : 'outline'}
                          colorScheme="brand"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </HStack>
                  </Flex>
                )}
              </VStack>
            )}
          </Box>
        </SimpleGrid>

        {/* Mobile Filter Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Filters</DrawerHeader>
            <DrawerBody>
              <VStack spacing={6} align="stretch">
                {/* Category Filter */}
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="semibold">Category</Text>
                  <Select
                    value={localCategory}
                    onChange={(e) => setLocalCategory(e.target.value)}
                    placeholder="All Categories"
                  >
                    {categoriesArray.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </VStack>

                {/* Condition Filter */}
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="semibold">Condition</Text>
                  <Select
                    value={localCondition}
                    onChange={(e) => setLocalCondition(e.target.value)}
                    placeholder="All Conditions"
                  >
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </VStack>

                {/* Price Range Filter */}
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="semibold">Price Range</Text>
                  <RangeSlider
                    value={localPriceRange}
                    onChange={handlePriceChange}
                    min={0}
                    max={10000}
                    step={100}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                  <HStack justify="space-between">
                    <Text fontSize="sm">${localPriceRange[0]}</Text>
                    <Text fontSize="sm">${localPriceRange[1]}</Text>
                  </HStack>
                </VStack>

                <Divider />

                {/* Apply Filters */}
                <Button
                  colorScheme="brand"
                  onClick={applyFilters}
                  size="lg"
                >
                  Apply Filters
                </Button>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  leftIcon={<CloseIcon />}
                  onClick={handleClearFilters}
                  size="lg"
                >
                  Clear Filters
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Container>
    </Box>
  );
};

export default ProductListPage; 