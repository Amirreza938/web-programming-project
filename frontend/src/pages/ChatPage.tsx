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
} from '@chakra-ui/react';
import { ArrowForwardIcon, SearchIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChatPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cardBg = useColorModeValue('white', 'gray.700');
  
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiService.getConversations(),
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: () => apiService.getMessages(selectedConversation!),
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversationId: number; message: string }) =>
      apiService.sendMessage(data.conversationId, data.message),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast({
        title: 'Error sending message',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      message: message.trim(),
    });
  };

  const filteredConversations = conversations?.filter((conv: any) =>
    conv.product_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const currentConversation = conversations?.find((conv: any) => conv.id === selectedConversation);

  if (conversationsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1200px">
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" color="brand.500">
            Messages
          </Heading>

          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} minH="600px">
            {/* Conversations List */}
            <Box gridColumn={{ lg: 'span 1' }}>
              <Card bg={cardBg} shadow="md" h="full">
                <CardBody p={4}>
                  <VStack spacing={4} align="stretch" h="full">
                    <Heading as="h2" size="md">
                      Conversations
                    </Heading>

                    {/* Search */}
                    <Box>
                      <InputGroup>
                        <InputLeftElement>
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search conversations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </InputGroup>
                    </Box>

                    <Divider />

                    {/* Conversations */}
                    <VStack spacing={2} align="stretch" flex={1} overflowY="auto">
                      {filteredConversations.length > 0 ? (
                        filteredConversations.map((conversation: any) => (
                          <Card
                            key={conversation.id}
                            cursor="pointer"
                            bg={selectedConversation === conversation.id ? 'brand.50' : 'transparent'}
                            border={selectedConversation === conversation.id ? '2px solid' : '1px solid'}
                            borderColor={selectedConversation === conversation.id ? 'brand.500' : 'gray.200'}
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => setSelectedConversation(conversation.id)}
                          >
                            <CardBody p={3}>
                              <VStack align="start" spacing={2}>
                                <HStack spacing={3} w="full">
                                  <Avatar
                                    size="sm"
                                    name={conversation.other_user_name}
                                    src={conversation.other_user_image}
                                  />
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text fontWeight="semibold" fontSize="sm">
                                      {conversation.other_user_name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                      {conversation.last_message}
                                    </Text>
                                  </VStack>
                                  {conversation.unread_count > 0 && (
                                    <Badge colorScheme="red" variant="solid" size="sm">
                                      {conversation.unread_count}
                                    </Badge>
                                  )}
                                </HStack>
                                
                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                  {conversation.product_title}
                                </Text>
                                
                                <Text fontSize="xs" color="gray.500">
                                  {new Date(conversation.updated_at).toLocaleDateString()}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <VStack spacing={4} py={8}>
                          <Text color="gray.600" textAlign="center">
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                          </Text>
                          {!searchQuery && (
                            <Button
                              colorScheme="brand"
                              onClick={() => window.location.href = '/products'}
                            >
                              Browse Products
                            </Button>
                          )}
                        </VStack>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </Box>

            {/* Chat Area */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <Card bg={cardBg} shadow="md" h="full">
                <CardBody p={0} display="flex" flexDirection="column">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <Box p={4} borderBottom="1px" borderColor="gray.200">
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={currentConversation?.other_user_name}
                            src={currentConversation?.other_user_image}
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold">
                              {currentConversation?.other_user_name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {currentConversation?.product_title}
                            </Text>
                          </VStack>
                          <Badge colorScheme="blue" variant="outline">
                            ${currentConversation?.product_price}
                          </Badge>
                        </HStack>
                      </Box>

                      {/* Messages */}
                      <Box flex={1} p={4} overflowY="auto" maxH="400px">
                        {messagesLoading ? (
                          <LoadingSpinner />
                        ) : (
                          <VStack spacing={4} align="stretch">
                            {messages && messages.length > 0 ? (
                              messages.map((msg: any) => (
                                <Box
                                  key={msg.id}
                                  alignSelf={msg.is_sender ? 'flex-end' : 'flex-start'}
                                  maxW="70%"
                                >
                                  <Card
                                    bg={msg.is_sender ? 'brand.500' : 'gray.100'}
                                    color={msg.is_sender ? 'white' : 'black'}
                                  >
                                    <CardBody p={3}>
                                      <VStack align="start" spacing={1}>
                                        <Text fontSize="sm">
                                          {msg.content}
                                        </Text>
                                        <Text fontSize="xs" opacity={0.7}>
                                          {new Date(msg.created_at).toLocaleTimeString()}
                                        </Text>
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                </Box>
                              ))
                            ) : (
                              <VStack spacing={4} py={8}>
                                <Text color="gray.600" textAlign="center">
                                  No messages yet
                                </Text>
                                <Text fontSize="sm" color="gray.500" textAlign="center">
                                  Start the conversation by sending a message
                                </Text>
                              </VStack>
                            )}
                            <div ref={messagesEndRef} />
                          </VStack>
                        )}
                      </Box>

                      {/* Message Input */}
                      <Box p={4} borderTop="1px" borderColor="gray.200">
                        <form onSubmit={handleSendMessage}>
                          <HStack spacing={3}>
                            <Textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type your message..."
                              rows={1}
                              resize="none"
                              flex={1}
                            />
                            <IconButton
                              type="submit"
                              aria-label="Send message"
                              icon={<ArrowForwardIcon />}
                              colorScheme="brand"
                              isLoading={sendMessageMutation.isPending}
                              isDisabled={!message.trim()}
                            />
                          </HStack>
                        </form>
                      </Box>
                    </>
                  ) : (
                    <VStack spacing={4} py={12} justify="center" h="full">
                      <Text color="gray.600" textAlign="center">
                        Select a conversation to start messaging
                      </Text>
                      <Button
                        colorScheme="brand"
                        onClick={() => window.location.href = '/products'}
                      >
                        Browse Products
                      </Button>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default ChatPage; 