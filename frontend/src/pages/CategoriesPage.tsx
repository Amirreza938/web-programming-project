import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  VStack,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiService, Category } from '../services/api';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    navigate(`/products?category=${categoryId}`);
  };

  if (isLoading) {
    return (
      <Center minH="50vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Center>
          <Text color="red.500">Failed to load categories</Text>
        </Center>
      </Container>
    );
  }

  const categoriesArray = Array.isArray(categories) ? categories : [];

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="2xl" color="brand.500">
              Browse Categories
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px">
              Discover products across different categories. Find exactly what you're looking for.
            </Text>
          </VStack>

          {categoriesArray.length === 0 ? (
            <Center>
              <Text fontSize="lg" color="gray.500">
                No categories available at the moment.
              </Text>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {categoriesArray.map((category: Category) => (
                <Card
                  key={category.id}
                  bg={cardBg}
                  shadow="md"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                    bg: hoverBg,
                  }}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="center" textAlign="center">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="md"
                          fallback={
                            <Box
                              boxSize="80px"
                              bg="gray.200"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="2xl">📦</Text>
                            </Box>
                          }
                        />
                      ) : (
                        <Box
                          boxSize="80px"
                          bg="gray.200"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="2xl">📦</Text>
                        </Box>
                      )}
                      
                      <VStack spacing={2}>
                        <Heading as="h3" size="md" color="brand.600">
                          {category.name}
                        </Heading>
                        
                        {category.description && (
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            noOfLines={2}
                            textAlign="center"
                          >
                            {category.description}
                          </Text>
                        )}
                        
                        {category.products_count !== undefined && (
                          <Badge colorScheme="blue" variant="subtle">
                            {category.products_count} products
                          </Badge>
                        )}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default CategoriesPage;
