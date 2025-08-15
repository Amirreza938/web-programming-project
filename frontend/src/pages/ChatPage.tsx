import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  Badge,
  Divider,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Flex,
  IconButton,
  Textarea,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { 
  ArrowForwardIcon, 
  SearchIcon, 
  AddIcon, 
  ChatIcon
} from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const ChatPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cardBg = useColorModeValue('white', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [selectedConversation, setSelectedConversation] = useState<{ id: number; type: 'product' | 'direct' } | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [newChatUserId, setNewChatUserId] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');

  const { user } = useAuth();

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiService.getConversations(),
    refetchInterval: 3000, // Refetch every 3 seconds for near real-time updates
    refetchIntervalInBackground: true,
  });

  // Fetch direct conversations
  const { data: directConversations, isLoading: directConversationsLoading } = useQuery({
    queryKey: ['directConversations'],
    queryFn: () => apiService.getDirectConversations(),
    refetchInterval: 3000, // Refetch every 3 seconds for near real-time updates
    refetchIntervalInBackground: true,
  });

  // Fetch users for new chat
  const { data: users } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: () => apiService.searchUsers(searchQuery),
    enabled: !!searchQuery,
  });

  // Effect to mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      console.log('Selected conversation changed:', selectedConversation);
      if (selectedConversation.type === 'product') {
        // Call conversation detail endpoint to mark as read for product conversations
        console.log('Marking product conversation as read:', selectedConversation.id);
        apiService.getConversation(selectedConversation.id).then(() => {
          console.log('Product conversation marked as read, refreshing list');
          // After marking as read, refresh the conversations list
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }).catch(console.error);
      } else {
        // For direct conversations, the mark-as-read happens when fetching messages
        // So we'll refresh the list after a short delay when messages are fetched
        console.log('Direct conversation selected, will refresh list after delay');
        const timer = setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['directConversations'] });
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedConversation, queryClient]);

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id, selectedConversation?.type],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      let result;
      if (selectedConversation.type === 'direct') {
        result = await apiService.getDirectConversationMessages(selectedConversation.id);
        // Direct message fetching automatically marks as read, so refresh the conversation list
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['directConversations'] });
        }, 200);
      } else {
        result = await apiService.getConversationMessages(selectedConversation.id);
      }
      
      return result;
    },
    enabled: !!selectedConversation,
    refetchInterval: 2000, // Refetch messages every 2 seconds for real-time chat
    refetchIntervalInBackground: true,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content, type }: { conversationId: number; content: string; type: 'product' | 'direct' }) => {
      if (type === 'direct') {
        return apiService.sendDirectMessage(conversationId, content);
      } else {
        return apiService.sendMessage(conversationId, content);
      }
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['directConversations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Start direct conversation mutation
  const startDirectConversationMutation = useMutation({
    mutationFn: ({ userId, message }: { userId: number; message: string }) => 
      apiService.startDirectConversation(userId, message),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Conversation started successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedConversation({ id: data.conversation_id, type: 'direct' });
      queryClient.invalidateQueries({ queryKey: ['directConversations'] });
      onClose();
      setNewChatUserId('');
      setNewChatMessage('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to start conversation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: message.trim(),
      type: selectedConversation.type,
    });
  };

  const handleStartDirectConversation = () => {
    if (!newChatUserId || !newChatMessage.trim()) return;

    startDirectConversationMutation.mutate({
      userId: parseInt(newChatUserId),
      message: newChatMessage.trim(),
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredConversations = conversations?.filter((conv: any) =>
    conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.product.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredDirectConversations = directConversations?.filter((conv: any) =>
    conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (conversationsLoading || directConversationsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1400px">
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" color="brand.500">
            Messages
          </Heading>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} minH="70vh">
            {/* Conversations List */}
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading as="h3" size="md">Conversations</Heading>
                    <IconButton
                      aria-label="Start new chat"
                      icon={<AddIcon />}
                      colorScheme="brand"
                      size="sm"
                      onClick={onOpen}
                    />
                  </HStack>

                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>

                  <Tabs index={activeTab} onChange={setActiveTab}>
                    <TabList>
                      <Tab>
                        <HStack>
                          <ChatIcon />
                          <Text>Products</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack>
                          <ChatIcon />
                          <Text>Direct</Text>
                        </HStack>
                      </Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel p={0} mt={4}>
                        <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
                          {filteredConversations.length === 0 ? (
                            <Text textAlign="center" color="gray.500" py={4}>
                              No product conversations yet
                            </Text>
                          ) : (
                            filteredConversations.map((conversation: any) => (
                              <Card
                                key={conversation.id}
                                cursor="pointer"
                                bg={selectedConversation?.id === conversation.id && selectedConversation?.type === 'product' ? 'brand.50' : 'transparent'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => setSelectedConversation({ id: conversation.id, type: 'product' })}
                              >
                                <CardBody p={3}>
                                  <HStack spacing={3}>
                                    <Avatar
                                      size="sm"
                                      name={conversation.other_user.username}
                                      src={conversation.other_user.profile_image}
                                    />
                                    <VStack align="start" spacing={1} flex={1}>
                                      <HStack justify="space-between" w="full">
                                        <Text fontWeight="bold" fontSize="sm">
                                          {conversation.other_user.username}
                                        </Text>
                                        {conversation.unread_count > 0 && (
                                          <Badge colorScheme="red" borderRadius="full">
                                            {conversation.unread_count}
                                          </Badge>
                                        )}
                                      </HStack>
                                      <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                        Product: {conversation.product.title}
                                      </Text>
                                      {conversation.last_message && (
                                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                          {conversation.last_message.content}
                                        </Text>
                                      )}
                                    </VStack>
                                  </HStack>
                                </CardBody>
                              </Card>
                            ))
                          )}
                        </VStack>
                      </TabPanel>

                      <TabPanel p={0} mt={4}>
                        <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto">
                          {filteredDirectConversations.length === 0 ? (
                            <Text textAlign="center" color="gray.500" py={4}>
                              No direct conversations yet
                            </Text>
                          ) : (
                            filteredDirectConversations.map((conversation: any) => (
                              <Card
                                key={conversation.id}
                                cursor="pointer"
                                bg={selectedConversation?.id === conversation.id && selectedConversation?.type === 'direct' ? 'brand.50' : 'transparent'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => setSelectedConversation({ id: conversation.id, type: 'direct' })}
                              >
                                <CardBody p={3}>
                                  <HStack spacing={3}>
                                    <Avatar
                                      size="sm"
                                      name={conversation.other_user.username}
                                      src={conversation.other_user.profile_image}
                                    />
                                    <VStack align="start" spacing={1} flex={1}>
                                      <HStack justify="space-between" w="full">
                                        <Text fontWeight="bold" fontSize="sm">
                                          {conversation.other_user.username}
                                        </Text>
                                        {conversation.unread_count > 0 && (
                                          <Badge colorScheme="red" borderRadius="full">
                                            {conversation.unread_count}
                                          </Badge>
                                        )}
                                      </HStack>
                                      {conversation.last_message && (
                                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                          {conversation.last_message.content}
                                        </Text>
                                      )}
                                    </VStack>
                                  </HStack>
                                </CardBody>
                              </Card>
                            ))
                          )}
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </VStack>
              </CardBody>
            </Card>

            {/* Chat Area */}
            <Box gridColumn={{ base: 1, lg: "span 2" }}>
              <Card bg={cardBg} shadow="md" h="70vh">
                <CardBody p={0} display="flex" flexDirection="column">
                  {selectedConversation ? (
                    <>
                      {/* Messages */}
                      <Box flex={1} p={4} overflowY="auto">
                        {messagesLoading ? (
                          <LoadingSpinner />
                        ) : (
                          <VStack spacing={3} align="stretch">
                            {messages?.map((msg: any) => (
                              <Flex
                                key={msg.id}
                                justify={msg.sender_name === user?.username ? 'flex-end' : 'flex-start'}
                              >
                                <Box
                                  maxW="70%"
                                  bg={msg.sender_name === user?.username ? 'brand.500' : 'gray.100'}
                                  color={msg.sender_name === user?.username ? 'white' : 'black'}
                                  p={3}
                                  borderRadius="lg"
                                  borderBottomRightRadius={msg.sender_name === user?.username ? 'sm' : 'lg'}
                                  borderBottomLeftRadius={msg.sender_name === user?.username ? 'lg' : 'sm'}
                                >
                                  <Text fontSize="sm">{msg.content}</Text>
                                  <Text
                                    fontSize="xs"
                                    opacity={0.7}
                                    mt={1}
                                  >
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                  </Text>
                                </Box>
                              </Flex>
                            ))}
                            <div ref={messagesEndRef} />
                          </VStack>
                        )}
                      </Box>

                      <Divider />

                      {/* Message Input */}
                      <Box p={4}>
                        <HStack spacing={2}>
                          <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            resize="none"
                            minH="40px"
                            maxH="120px"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <IconButton
                            aria-label="Send message"
                            icon={<ArrowForwardIcon />}
                            colorScheme="brand"
                            isLoading={sendMessageMutation.isPending}
                            onClick={handleSendMessage}
                            isDisabled={!message.trim()}
                          />
                        </HStack>
                      </Box>
                    </>
                  ) : (
                    <Flex align="center" justify="center" h="full">
                      <VStack spacing={4}>
                        <ChatIcon boxSize={16} color="gray.300" />
                        <Text color="gray.500" textAlign="center">
                          Select a conversation to start messaging
                        </Text>
                      </VStack>
                    </Flex>
                  )}
                </CardBody>
              </Card>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>

      {/* New Chat Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Search Users</FormLabel>
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </FormControl>

              {users && users.length > 0 && (
                <FormControl>
                  <FormLabel>Select User</FormLabel>
                  <Select
                    placeholder="Choose a user"
                    value={newChatUserId}
                    onChange={(e) => setNewChatUserId(e.target.value)}
                  >
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.full_name})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Initial Message</FormLabel>
                <Textarea
                  placeholder="Type your message..."
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleStartDirectConversation}
              isLoading={startDirectConversationMutation.isPending}
              isDisabled={!newChatUserId || !newChatMessage.trim()}
            >
              Start Conversation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChatPage;
