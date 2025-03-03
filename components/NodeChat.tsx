import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  Input, 
  Button, 
  HStack, 
  Avatar, 
  Flex, 
  Spinner,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { usePonderData } from '../hooks/usePonderData';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';

interface NodeChatProps {
  nodeId?: string;
}

const NodeChat: React.FC<NodeChatProps> = ({ nodeId }) => {
  const { address } = useAccount();
  const { getNodeChatMessages, sendChatMessage, isLoading } = usePonderData();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (!nodeId) return;
    
    const fetchMessages = async () => {
      try {
        const data = await getNodeChatMessages(nodeId, 50);
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [nodeId, getNodeChatMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !newMessage.trim() || !nodeId) {
      return;
    }
    
    setIsSending(true);
    
    try {
      await sendChatMessage(nodeId, address, newMessage.trim());
      // Optimistically add the message to the UI
      const newMsg = {
        id: `temp-${Date.now()}`,
        node_id: nodeId,
        sender: address,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
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
          <HStack>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              bg={inputBg}
              disabled={!address || isSending}
            />
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isSending}
              loadingText="Sending"
              disabled={!address || !newMessage.trim() || isSending}
            >
              Send
            </Button>
          </HStack>
          {!address && (
            <Text fontSize="sm" color="red.500" mt={2}>
              Please connect your wallet to send messages
            </Text>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default NodeChat;
