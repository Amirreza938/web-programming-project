import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, VStack, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  requiresApproval?: boolean;
  allowedRoles?: Array<'buyer' | 'seller' | 'both' | 'admin'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
  requiresAdmin = false,
  requiresApproval = false,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box 
        minH="50vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading...</Text>
        </VStack>
      </Box>
    );
  }

  // Check authentication
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (requiresAdmin && user?.user_type !== 'admin') {
    return (
      <Box minH="50vh" p={8}>
        <Alert status="error">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Box>
    );
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.user_type as any)) {
    return (
      <Box minH="50vh" p={8}>
        <Alert status="error">
          <AlertIcon />
          Access denied. Insufficient permissions for your account type.
        </Alert>
      </Box>
    );
  }

  // Check approval status for sellers and both
  if (requiresApproval && user && 
      (user.user_type === 'seller' || user.user_type === 'both') && 
      !user.account_approved) {
    return <Navigate to="/approval-pending" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
