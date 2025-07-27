import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  alpha,
  styled,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart,
  Favorite,
  Chat,
  Person,
  Logout,
  Dashboard,
  Add,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unread counts for notifications
  const { data: unreadCounts } = useQuery({
    queryKey: ['unreadCounts'],
    queryFn: () => apiService.getUnreadCounts(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleDashboardClick = () => {
    handleMenuClose();
    navigate('/dashboard');
  };

  const handleCreateProductClick = () => {
    handleMenuClose();
    navigate('/create-product');
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          SecondHand Market
        </Typography>

        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, mx: 2 }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/products')}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            Browse
          </Button>

          {isAuthenticated ? (
            <>
              {/* Favorites */}
              <IconButton
                color="inherit"
                onClick={() => navigate('/favorites')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                <Badge badgeContent={0} color="secondary">
                  <Favorite />
                </Badge>
              </IconButton>

              {/* Chat */}
              <IconButton
                color="inherit"
                onClick={() => navigate('/chat')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                <Badge badgeContent={unreadCounts?.unread_messages || 0} color="secondary">
                  <Chat />
                </Badge>
              </IconButton>

              {/* Orders */}
              <IconButton
                color="inherit"
                onClick={() => navigate('/orders')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                <Badge badgeContent={0} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                >
                  {user?.first_name?.[0] || user?.username?.[0] || <Person />}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleProfileClick}>
                  <Person sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleDashboardClick}>
                  <Dashboard sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>
                {user?.user_type !== 'buyer' && (
                  <MenuItem onClick={handleCreateProductClick}>
                    <Add sx={{ mr: 1 }} />
                    Create Product
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/register')}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 