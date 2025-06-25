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
  Tooltip,
  Flex
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { formatDistanceToNow, format } from 'date-fns';
import { useChat } from '../hooks/useChat';
// Format address helper function
const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

type NodeState = {
  membersOfNode?: string[];
  // Add other properties as needed
};

interface ChatMessage {
  id: string | number;
  nodeId: string;
  sender: string;
  content: string;
  timestamp: string;
  networkId?: string;
  ensName?: string;
}

interface NodeChatProps {
  nodeId: string;
  chainId?: number;
  nodeData: any;
  userAddress?: string;
}

const NodeChat: React.FC<NodeChatProps> = ({ nodeId, chainId, nodeData, userAddress }) => {
  const { address } = useAccount();
  const { authenticated, user } = usePrivy();
  const toast = useToast();
  
  const authenticatedAddress = user?.wallet?.address || address || '';
  const [isSending, setIsSending] = useState(false);
  
  // Use the new useChat hook
  const { 
    messages = [], 
    isLoading, 
    error,
    sendMessage
  } = useChat({
    nodeId: nodeId || '',
    networkId: chainId?.toString() || '1',
    pollInterval: 10000, // 10 seconds
  });
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  // Auto-scroll to bottom when new messages arrive or when component mounts
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isScrolledToBottom || shouldScrollToBottom) {
        container.scrollTop = container.scrollHeight;
        setShouldScrollToBottom(false);
      }
    }
  }, [messages, shouldScrollToBottom]);
  
  // Handle errors from the useChat hook
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load chat messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);
  
  const isMember = userAddress ? nodeData?.membersOfNode?.includes(userAddress) : false;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  
  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticatedAddress || !newMessage.trim() || !nodeId || !authenticated) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet to send messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

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
    
    try {
      setIsSending(true);
      // Use sendMessage from useChat hook
      await sendMessage(newMessage.trim(), authenticatedAddress);
      setNewMessage('');
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error('Error sending message:', error);
      // Error is already handled in the useChat hook
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(Number(timestamp));
      const relative = formatDistanceToNow(date, { addSuffix: true });
      const absolute = format(date, 'yyyy-MM-dd HH:mm');
      return { relative, absolute };
    } catch (e) {
      return { relative: 'just now', absolute: '' };
    }
  };
  
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

  const getDisplayName = (address: string) => {
    if (!address) return 'Unknown';
    if (address.toLowerCase() === authenticatedAddress?.toLowerCase()) return 'You';
    // The useChat hook already handles ENS resolution, so we can use the ensName from the message
    const message = messages.find(msg => msg.sender.toLowerCase() === address.toLowerCase());
    return message?.ensName || formatAddress(address);
  };

  const renderMessages = () => {
    if (isLoading) {
      return (
        <Flex justify="center" py={4}>
          <Spinner size="md" />
        </Flex>
      );
    }

    if (!messages || messages.length === 0) {
      return (
        <Text color="gray.500" textAlign="center" py={4}>
          No messages yet. Be the first to send a message!
        </Text>
      );
    }

    return messages.map((msg: any) => (
      <Box key={msg.id} mb={4}>
        <HStack spacing={2} align="flex-start">
          <Avatar size="sm" name={msg.sender} src={''} />
          <Box>
            <HStack spacing={2} align="baseline">
              <Text fontWeight="bold" fontSize="sm">
                {getDisplayName(msg.sender)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
              </Text>
            </HStack>
            <Text fontSize="sm" mt={1}>
              {msg.content}
            </Text>
          </Box>
        </HStack>
      </Box>
    ));
  };

  if (isLoading && messages.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color="purple.500" />
        <Text mt={4}>Loading chat...</Text>
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
        <Text fontSize="lg" fontWeight="bold">(Unsecure)Node Chat</Text>
        <Text fontSize="sm" color="gray.500">
          Trollbox for members of this node.
        </Text>
      </Box>
      
      <VStack 
        ref={messagesContainerRef}
        flex="1" 
        overflowY="auto" 
        spacing={4} 
        p={4} 
        align="stretch"
        onScroll={() => {
          const container = messagesContainerRef.current;
          if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
            setShouldScrollToBottom(isAtBottom);
          }
        }}
      >
        {renderMessages()}
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
