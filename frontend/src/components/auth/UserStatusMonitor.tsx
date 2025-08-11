import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@chakra-ui/react';

const UserStatusMonitor: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const previousApprovalStatus = useRef<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    // Track initial approval status
    if (previousApprovalStatus.current === null) {
      previousApprovalStatus.current = user.account_approved;
    }

    // Only monitor users who are pending approval or were recently approved
    if (user.user_type === 'seller' || user.user_type === 'both') {
      if (!user.account_approved) {
        // Poll for approval status every 15 seconds for pending users
        const interval = setInterval(async () => {
          try {
            console.log('Checking for user approval status...');
            await refreshUser();
          } catch (error) {
            console.error('Failed to refresh user status:', error);
          }
        }, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
      }
    }
  }, [user?.account_approved, refreshUser]);

  // Detect approval status changes
  useEffect(() => {
    if (user && (user.user_type === 'seller' || user.user_type === 'both')) {
      console.log('Current user approval status:', user.account_approved);
      console.log('Previous approval status:', previousApprovalStatus.current);
      
      // Check if approval status changed from false to true
      if (user.account_approved && previousApprovalStatus.current === false) {
        console.log('User was just approved! Showing toast and reloading...');
        toast({
          title: 'Account Approved! 🎉',
          description: 'Your seller account has been approved! You can now start selling products.',
          status: 'success',
          duration: 8000,
          isClosable: true,
          position: 'top',
        });
        
        // Reload the page to ensure all permissions are updated
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
      // Update the previous status
      previousApprovalStatus.current = user.account_approved;
    }
  }, [user?.account_approved, toast]);

  return null; // This component doesn't render anything
};

export default UserStatusMonitor;
