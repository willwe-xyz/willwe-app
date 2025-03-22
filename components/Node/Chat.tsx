import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  Input, 
  Button, 
  HStack, 
  Avatar, 
  Spinner,
  useColorModeValue,
  Divider,
  useToast,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react';
import { usePonderData } from '../../hooks/usePonderData';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';

interface ChatProps {
  nodeId: string;
  networkId: string; // Add networkId as a prop
}

export const Chat: React.FC<ChatProps> = ({ nodeId, networkId }) => {
  const { address } = useAccount();
  const { getNodeChatMessages, sendChatMessage, validateChatMessage, isLoading } = usePonderData();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [validationError, setValidationError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  // Use the provided networkId or fall back to the default
  const effectiveNetworkId = networkId;
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (!nodeId || !networkId) return;

    // Establish WebSocket connection
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/chat?nodeId=${nodeId}&networkId=${networkId}`);
    setSocket(ws);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'WebSocket Error',
        description: 'An error occurred with the chat connection.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [nodeId, networkId, toast]);

  useEffect(() => {
    if (!nodeId) return;
    
    const fetchMessages = async () => {
      try {
        console.log(`Fetching chat messages for node ${nodeId} on network ${effectiveNetworkId}`);
        const data = await getNodeChatMessages(nodeId, networkId, 50);
        console.log(`Received ${data?.length || 0} chat messages`);
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        toast({
          title: 'Error fetching chat messages',
          description: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [nodeId, effectiveNetworkId, getNodeChatMessages, toast]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Validate message as user types
  useEffect(() => {
    const validateMessage = async () => {
      if (!newMessage.trim()) {
        setValidationError('');
        return;
      }
      
      try {
        const { isValid, validations } = await validateChatMessage(newMessage);
        
        if (!isValid) {
          if (validations.tooLong) {
            setValidationError(`Message is too long (max 1000 characters, current: ${newMessage.length})`);
          } else if (validations.isEmpty) {
            setValidationError('Message cannot be empty');
          } else if (validations.hasInvalidChars) {
            setValidationError('Message contains invalid characters');
          } else {
            setValidationError('Invalid message');
          }
        } else {
          setValidationError('');
        }
      } catch (error) {
        console.error('Validation error:', error);
        // Simple client-side validation fallback
        if (newMessage.length > 1000) {
          setValidationError(`Message is too long (max 1000 characters, current: ${newMessage.length})`);
        } else {
          setValidationError('');
        }
      }
    };
    
    const debounce = setTimeout(validateMessage, 300);
    return () => clearTimeout(debounce);
  }, [newMessage, validateChatMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !newMessage.trim() || !nodeId || validationError) {
      return;
    }
    
    setIsSending(true);
    
    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        nodeId,
        sender: address,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        networkId,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage('');

      // Send message via WebSocket if available
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(tempMessage));
      } else {
        // Fallback to API call
        const result = await sendChatMessage(nodeId, tempMessage.content, networkId);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempMessage.id ? result : msg))
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string | number) => {
    try {
      const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return 'just now';
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color="purple.500" />
        <Text mt={4}>Loading chat messages...</Text>
      </Box>
    );
  }

  return (
    <Box
      borderRadius="lg"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      height="500px"
      display="flex"
      flexDirection="column"
    >
      <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold">Node Chat</Text>
        <Text fontSize="sm" color="gray.500">
          Discuss with other members of this node
        </Text>
      </Box>
      
      <VStack 
        flex="1" 
        overflowY="auto" 
        spacing={4} 
        p={4} 
        align="stretch"
      >
        {messages.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No messages yet. Start the conversation!</Text>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box key={message.id || index}>
              <HStack spacing={3} align="start">
                <Avatar 
                  size="sm" 
                  name={formatAddress(message.sender)} 
                  bg={message.sender === address ? "purple.500" : "gray.500"}
                />
                <Box>
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="sm">
                      {message.sender === address ? 'You' : formatAddress(message.sender)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatTimestamp(message.timestamp)}
                    </Text>
                  </HStack>
                  <Text mt={1}>{message.content}</Text>
                </Box>
              </HStack>
              {index < messages.length - 1 && <Divider my={3} />}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </VStack>
      
      <Box p={4} borderTop="1px solid" borderColor={borderColor}>
        <form onSubmit={handleSendMessage}>
          <FormControl isInvalid={!!validationError}>
            <HStack>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                bg={inputBg}
                disabled={!address || isSending}
                maxLength={1000}
              />
              <Button
                colorScheme="purple"
                type="submit"
                isLoading={isSending}
                loadingText="Sending"
                disabled={!address || !newMessage.trim() || isSending || !!validationError}
              >
                Send
              </Button>
            </HStack>
            {validationError && <FormErrorMessage>{validationError}</FormErrorMessage>}
            {!address && (
              <Text fontSize="sm" color="red.500" mt={2}>
                Please connect your wallet to send messages
              </Text>
            )}
          </FormControl>
        </form>
      </Box>
    </Box>
  );
};