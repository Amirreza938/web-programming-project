import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Badge,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import {
  SearchIcon,
  HamburgerIcon,
  BellIcon,
  ChatIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <Button
      variant="ghost"
      onClick={() => navigate(href)}
      _hover={{ bg: 'brand.50' }}
      color="gray.700"
    >
      {children}
    </Button>
  );

  return (
    <>
      <Box
        as="nav"
        bg={bg}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={1000}
      >
        <Flex
          maxW="1200px"
          mx="auto"
          px={4}
          py={3}
          align="center"
          justify="space-between"
        >
          {/* Logo */}
          <Flex align="center" cursor="pointer" onClick={() => navigate('/')}>
            <Text fontSize="2xl" fontWeight="bold" color="brand.500">
              SecondHand
            </Text>
          </Flex>

          {/* Desktop Navigation */}
          <Flex align="center" display={{ base: 'none', md: 'flex' }}>
            <NavLink href="/products">Browse</NavLink>
            <NavLink href="/categories">Categories</NavLink>
            {isAuthenticated && user?.can_sell && (
              <NavLink href="/create-product">Sell</NavLink>
            )}
          </Flex>

          {/* Search Bar */}
          <Box flex={1} maxW="400px" mx={4} display={{ base: 'none', md: 'block' }}>
            <form onSubmit={handleSearch}>
              <InputGroup>
                <InputLeftElement>
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </form>
          </Box>

          {/* User Menu */}
          <Flex align="center" gap={2}>
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <IconButton
                  aria-label="Notifications"
                  icon={<BellIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/chat')}
                />

                {/* Messages */}
                <IconButton
                  aria-label="Messages"
                  icon={<ChatIcon />}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/chat')}
                />

                {/* User Menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="sm"
                    px={2}
                    py={2}
                    _hover={{ bg: 'gray.100' }}
                  >
                    <HStack spacing={2}>
                      <Avatar size="sm" name={`${user?.first_name} ${user?.last_name}`} />
                      <Text fontSize="sm" display={{ base: 'none', lg: 'block' }}>
                        {user?.first_name}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </MenuItem>
                    {user?.user_type === 'admin' ? (
                      <MenuItem onClick={() => navigate('/admin-dashboard')}>
                        Admin Dashboard
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={() => navigate('/dashboard')}>
                        Dashboard
                      </MenuItem>
                    )}
                    {user?.can_buy && (
                      <>
                        <MenuItem onClick={() => navigate('/orders')}>
                          My Orders
                        </MenuItem>
                        <MenuItem onClick={() => navigate('/offers')}>
                          Offers
                        </MenuItem>
                        <MenuItem onClick={() => navigate('/favorites')}>
                          Favorites
                        </MenuItem>
                        <MenuItem onClick={() => navigate('/my-reports')}>
                          My Reports
                        </MenuItem>
                      </>
                    )}
                    <MenuDivider />
                    <MenuItem onClick={handleLogout} icon={<SettingsIcon />}>
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  colorScheme="brand"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              size="sm"
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
            />
          </Flex>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {/* Mobile Search */}
              <Box>
                <form onSubmit={handleSearch}>
                  <InputGroup>
                    <InputLeftElement>
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                </form>
              </Box>

              {/* Mobile Navigation */}
              <VStack spacing={2} align="stretch">
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate('/products');
                    onClose();
                  }}
                >
                  Browse Products
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate('/categories');
                    onClose();
                  }}
                >
                  Categories
                </Button>
                {isAuthenticated && user?.can_sell && (
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => {
                      navigate('/create-product');
                      onClose();
                    }}
                  >
                    Sell Your Items
                  </Button>
                )}
              </VStack>

              {isAuthenticated && (
                <>
                  <Divider />
                  <VStack spacing={2} align="stretch">
                    <Button
                      variant="ghost"
                      justifyContent="flex-start"
                      onClick={() => {
                        navigate('/profile');
                        onClose();
                      }}
                    >
                      Profile
                    </Button>
                    {user?.user_type === 'admin' ? (
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        onClick={() => {
                          navigate('/admin-dashboard');
                          onClose();
                        }}
                      >
                        Admin Dashboard
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        justifyContent="flex-start"
                        onClick={() => {
                          navigate('/dashboard');
                          onClose();
                        }}
                      >
                        Dashboard
                      </Button>
                    )}
                    {user?.can_buy && (
                      <>
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => {
                            navigate('/orders');
                            onClose();
                          }}
                        >
                          My Orders
                        </Button>
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => {
                            navigate('/offers');
                            onClose();
                          }}
                        >
                          Offers
                        </Button>
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => {
                            navigate('/favorites');
                            onClose();
                          }}
                        >
                          Favorites
                        </Button>
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => {
                            navigate('/my-reports');
                            onClose();
                          }}
                        >
                          My Reports
                        </Button>
                        <Button
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => {
                            navigate('/chat');
                            onClose();
                          }}
                        >
                          Messages
                        </Button>
                      </>
                    )}
                  </VStack>
                  <Divider />
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    colorScheme="red"
                    leftIcon={<SettingsIcon />}
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Divider />
                  <VStack spacing={2} align="stretch">
                    <Button
                      colorScheme="brand"
                      onClick={() => {
                        navigate('/login');
                        onClose();
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="brand"
                      onClick={() => {
                        navigate('/register');
                        onClose();
                      }}
                    >
                      Sign Up
                    </Button>
                  </VStack>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;