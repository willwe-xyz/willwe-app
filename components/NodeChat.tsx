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
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { formatDistanceToNow } from 'date-fns';
import { NodeState } from '../types/chainData';
import { usePonderData } from '@/hooks/usePonderData';
import { limits } from 'chroma-js';

interface NodeChatProps {
  nodeId: string;
  chainId: string;
  nodeData: NodeState;
  userAddress: string;
}

interface ChatMessage {
  id: string;
  nodeId: string;
  sender: string;
  content: string;
  timestamp: string;
}

const NodeChat: React.FC<NodeChatProps> = ({ nodeId, chainId, nodeData, userAddress }) => {
  const { address } = useAccount();
  const { authenticated, user } = usePrivy();
  const { getNodeChatMessages, sendChatMessage, isLoading } = usePonderData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  const authenticatedAddress = user?.wallet?.address || address;
  const isMember = userAddress ? nodeData?.membersOfNode?.includes(userAddress) : false;
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (!nodeId) return;
    
    const fetchMessages = async () => {
      try {
        const data = await getNodeChatMessages(nodeId, 200);
        const sortedMessages = data.sort((a: ChatMessage, b: ChatMessage) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        toast({
          title: "Error",
          description: "Failed to load chat messages",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [nodeId, getNodeChatMessages, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticatedAddress || !newMessage.trim() || !nodeId || !authenticated) {
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
    
    setIsSending(true);
    
    try {
      const result = await sendChatMessage(nodeId, authenticatedAddress, newMessage.trim(), chainId);
      console.log('Chat message result:', result);
      
      // Handle different response formats from the Ponder server
      const messageToAdd = result.message || result;
      setMessages(prev => [messageToAdd, ...prev]);
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
          Discuss with other members of this node ***(!!!!)
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
                <Box flex="1">
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
                  <Text mt={1} wordBreak="break-word">{message.content}</Text>
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
