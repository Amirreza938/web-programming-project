import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Button,
  Divider,
  Badge,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send,
  Person,
  ArrowBack,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChatPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversation: number; content: string }) => {
      return await apiService.sendMessage(messageData);
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', selectedConversation]);
      queryClient.invalidateQueries(['conversations']);
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
      conversation: selectedConversation,
      content: message.trim(),
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const selectedConversationData = conversations?.find(c => c.id === selectedConversation);

  if (conversationsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>

        <Grid container spacing={3} sx={{ height: '70vh' }}>
          {/* Conversations List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  Conversations ({conversations?.length || 0})
                </Typography>
              </Box>
              
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {conversations && conversations.length > 0 ? (
                  <List>
                    {conversations.map((conversation, index) => (
                      <React.Fragment key={conversation.id}>
                        <ListItem
                          button
                          selected={selectedConversation === conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              badgeContent={conversation.unread_count}
                              color="error"
                              invisible={conversation.unread_count === 0}
                            >
                              <Avatar>
                                <Person />
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={conversation.other_user.username}
                            secondary={
                              <Box>
                                <Typography variant="body2" noWrap>
                                  {conversation.last_message?.content || 'No messages yet'}
                                </Typography>
                                {conversation.last_message && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTime(conversation.last_message.created_at)}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < conversations.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No conversations yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Messages Area */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconButton
                        onClick={() => setSelectedConversation(null)}
                        sx={{ display: { md: 'none' } }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {selectedConversationData?.other_user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedConversationData?.product.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={`$${selectedConversationData?.product.price}`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Messages */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {messagesLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : messages && messages.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {messages.map((msg) => (
                          <Box
                            key={msg.id}
                            sx={{
                              display: 'flex',
                              justifyContent: msg.sender === selectedConversationData?.other_user.id ? 'flex-start' : 'flex-end',
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth: '70%',
                                bgcolor: msg.sender === selectedConversationData?.other_user.id ? 'grey.100' : 'primary.main',
                                color: msg.sender === selectedConversationData?.other_user.id ? 'text.primary' : 'white',
                                p: 2,
                                borderRadius: 2,
                                wordBreak: 'break-word',
                              }}
                            >
                              <Typography variant="body1">
                                {msg.content}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                                {formatTime(msg.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                        <div ref={messagesEndRef} />
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Message Input */}
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={sendMessageMutation.isLoading}
                        multiline
                        maxRows={3}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!message.trim() || sendMessageMutation.isLoading}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        {sendMessageMutation.isLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Send />
                        )}
                      </Button>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Select a conversation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose a conversation from the list to start messaging
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ChatPage; 