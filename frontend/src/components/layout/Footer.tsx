import React from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Badge,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const Footer: React.FC = () => {
  return (
    <Box bg="gray.50" borderTop="1px" borderColor="gray.200" mt="auto">
      <Container maxW="1200px" py={8}>
        <SimpleGrid columns={{ base: 1, md: 4 }} gap={8}>
          {/* Company Info */}
          <Stack gap={4}>
            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              SecondHand
            </Text>
            <Text fontSize="sm" color="gray.600">
              Your trusted marketplace for buying and selling second-hand items. 
              Connect with local buyers and sellers in your community.
            </Text>
            <Flex gap={2}>
              <Badge colorScheme="brand" variant="outline">
                Secure
              </Badge>
              <Badge colorScheme="green" variant="outline">
                Local
              </Badge>
              <Badge colorScheme="purple" variant="outline">
                Eco-friendly
              </Badge>
            </Flex>
          </Stack>

          {/* Quick Links */}
          <Stack gap={4}>
            <Text fontWeight="semibold" fontSize="md">
              Quick Links
            </Text>
            <Stack gap={2}>
              <Link href="/products" color="gray.600" _hover={{ color: 'brand.500' }}>
                Browse Products
              </Link>
              <Link href="/create-product" color="gray.600" _hover={{ color: 'brand.500' }}>
                Sell Your Items
              </Link>
              <Link href="/categories" color="gray.600" _hover={{ color: 'brand.500' }}>
                Categories
              </Link>
              <Link href="/how-it-works" color="gray.600" _hover={{ color: 'brand.500' }}>
                How It Works
              </Link>
            </Stack>
          </Stack>

          {/* Support */}
          <Stack gap={4}>
            <Text fontWeight="semibold" fontSize="md">
              Support
            </Text>
            <Stack gap={2}>
              <Link href="/help" color="gray.600" _hover={{ color: 'brand.500' }}>
                Help Center
              </Link>
              <Link href="/contact" color="gray.600" _hover={{ color: 'brand.500' }}>
                Contact Us
              </Link>
              <Link href="/disputes" color="gray.600" _hover={{ color: 'brand.500' }}>
                Dispute Resolution
              </Link>
              <Link href="/safety" color="gray.600" _hover={{ color: 'brand.500' }}>
                Safety Tips
              </Link>
            </Stack>
          </Stack>

          {/* Legal */}
          <Stack gap={4}>
            <Text fontWeight="semibold" fontSize="md">
              Legal
            </Text>
            <Stack gap={2}>
              <Link href="/terms" color="gray.600" _hover={{ color: 'brand.500' }}>
                Terms of Service
              </Link>
              <Link href="/privacy" color="gray.600" _hover={{ color: 'brand.500' }}>
                Privacy Policy
              </Link>
              <Link href="/cookies" color="gray.600" _hover={{ color: 'brand.500' }}>
                Cookie Policy
              </Link>
              <Link href="/accessibility" color="gray.600" _hover={{ color: 'brand.500' }}>
                Accessibility
              </Link>
            </Stack>
          </Stack>
        </SimpleGrid>

        {/* Bottom Section */}
        <Box borderTop="1px" borderColor="gray.200" mt={8} pt={6}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            gap={4}
          >
            <Text fontSize="sm" color="gray.600">
              © 2024 SecondHand. All rights reserved.
            </Text>
            <Flex gap={4} fontSize="sm" color="gray.600">
              <Link href="/sitemap" _hover={{ color: 'brand.500' }}>
                Sitemap
              </Link>
              <Link href="/status" _hover={{ color: 'brand.500' }}>
                Status
              </Link>
              <Link href="/api" _hover={{ color: 'brand.500' }}>
                API
                <ExternalLinkIcon mx="2px" />
              </Link>
            </Flex>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 