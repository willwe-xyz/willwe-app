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
  Tooltip
} from '@chakra-ui/react';
import { useChat } from '../hooks/useChat';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { formatDistanceToNow } from 'date-fns';
import { NodeState } from '../types/chainData';

interface NodeChatProps {
  nodeId?: string;
  nodeData?: NodeState;
  userAddress?: string;
}

const NodeChat: React.FC<NodeChatProps> = ({ nodeId, nodeData, userAddress }) => {
  const { address } = useAccount();
  const { authenticated, user } = usePrivy();
  const { getNodeChatMessages, sendChatMessage, isLoading } = useChat();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  // Use Privy authenticated address if available, otherwise use the wallet address
  const authenticatedAddress = user?.wallet?.address || address;
  
  // Check if the current user is a member of the node
  const isMember = userAddress ? nodeData?.membersOfNode?.includes(userAddress) : false;
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (!nodeId) return;
    
    const fetchMessages = async () => {
      try {
        const data = await getNodeChatMessages(nodeId, 50);
        // Sort messages by timestamp in ascending order (oldest first, newest last)
        const sortedData = [...(data || [])].sort((a, b) => {
          // Convert timestamps to numeric values for comparison
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeA - timeB;
        });
        setMessages(sortedData);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        toast({
          title: "Error",
          description: "Failed to load chat messages.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [nodeId, getNodeChatMessages, toast]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticatedAddress || !newMessage.trim() || !nodeId || !authenticated) {
      return;
    }
    
    // Check if user is a member before allowing to send message
    if (!isMember) {
      toast({
        title: "Not a member",
        description: "Only node members can send messages in this chat.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const result = await sendChatMessage(nodeId, authenticatedAddress, newMessage.trim());
      
      // Add new message to the UI based on the API response
      if (result.success && result.message) {
        // Use the message from API response
        const newMsg = result.message;
        // Add new message to the end of the array (newest at bottom)
        setMessages(prev => [...prev, newMsg]);
      } else {
        // Fallback to optimistic UI update if API doesn't return the message
        const newMsg = {
          id: `temp-${Date.now()}`,
          nodeId: nodeId,
          sender: authenticatedAddress,
          content: newMessage.trim(),
          timestamp: new Date().toISOString()
        };
        // Add new message to the end of the array (newest at bottom)
        setMessages(prev => [...prev, newMsg]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        status: "error",
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

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };
  
  // Function to copy address to clipboard
  const copyAddressToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied",
      description: "Address copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
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
                  bg={message.sender === authenticatedAddress ? "purple.500" : "gray.500"}
                />
                <Box>
                  <HStack spacing={2}>
                    <Tooltip label="Click to copy address" placement="top">
                      <Text 
                        fontWeight="bold" 
                        fontSize="sm"
                        cursor="pointer"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={() => copyAddressToClipboard(message.sender)}
                      >
                        {message.sender === authenticatedAddress ? 'You' : formatAddress(message.sender)}
                      </Text>
                    </Tooltip>
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
              disabled={!authenticatedAddress || isSending || !isMember || !authenticated}
            />
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isSending}
              loadingText="Sending"
              disabled={!authenticatedAddress || !newMessage.trim() || isSending || !isMember || !authenticated}
            >
              Send
            </Button>
          </HStack>
          {!authenticatedAddress && (
            <Text fontSize="sm" color="red.500" mt={2}>
              Please connect your wallet to send messages
            </Text>
          )}
          {authenticatedAddress && !authenticated && (
            <Text fontSize="sm" color="red.500" mt={2}>
              Please authenticate with Privy to send messages
            </Text>
          )}
          {authenticatedAddress && authenticated && !isMember && (
            <Text fontSize="sm" color="red.500" mt={2}>
              Only node members can send messages in this chat
            </Text>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default NodeChat;
