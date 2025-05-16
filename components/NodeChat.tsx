import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Flex,
  Badge
} from '@chakra-ui/react';
import { useAppKit } from '../hooks/useAppKit';
import { formatDistanceToNow } from 'date-fns';
import { NodeState } from '../types/chainData';
import { usePonderData } from '../hooks/usePonderData';
import { limits } from 'chroma-js';
import { resolveENS } from '@/utils/ensUtils';

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
}

interface NodeChatProps {
  nodeId: string;
  chainId: string;
  nodeData: NodeState;
  userAddress?: string;
}

const NodeChat: React.FC<NodeChatProps> = ({ nodeId, chainId, nodeData, userAddress }) => {
  const { user: { isAuthenticated, wallet }, login } = useAppKit();
  const { getNodeChatMessages, sendChatMessage, isLoading } = usePonderData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const lastMessageIdRef = useRef<string | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);
  const toast = useToast();
  const [ensNames, setEnsNames] = useState<Record<string, string>>({});
  
  const authenticatedAddress = wallet?.address || userAddress;
  const isMember = nodeData?.membersOfNode?.includes(authenticatedAddress || '');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!nodeId || !isMountedRef.current) return;
    
    try {
      const data = await getNodeChatMessages(nodeId, 200);
      
      // If we get an empty array or null, don't update the state
      if (!data || !Array.isArray(data)) {
        return;
      }
      
      const messages = data as ChatMessage[];
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Check if we actually have new messages
      const latestMessageId = sortedMessages[sortedMessages.length - 1]?.id;
      if (latestMessageId === lastMessageIdRef.current) {
        return; // No new messages, don't update state
      }
      
      // Preserve scroll position when updating messages
      const container = messagesContainerRef.current;
      const wasAtBottom = container ? 
        container.scrollHeight - container.scrollTop === container.clientHeight : 
        true;
      
      if (isMountedRef.current) {
        console.log('Updating messages:', sortedMessages); // Debug log
        setMessages(sortedMessages);
        lastMessageIdRef.current = latestMessageId;
        
        // Only scroll to bottom if we were already at the bottom
        if (wasAtBottom) {
          setShouldScrollToBottom(true);
        }
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      // Don't show error toast for 404s or when the server is not available
      if (error instanceof Error && !error.message.includes('404') && !error.message.includes('Failed to fetch')) {
        if (isMountedRef.current) {
          toast({
            title: "Error",
            description: "Failed to load chat messages",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } finally {
      // Schedule next poll only if component is still mounted and we're not in an error state
      if (isMountedRef.current) {
        pollTimeoutRef.current = setTimeout(fetchMessages, 10000);
      }
    }
  }, [nodeId, getNodeChatMessages, toast]);

  // Initial fetch and start polling
  useEffect(() => {
    if (nodeId) {
      fetchMessages();
    }
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [nodeId, fetchMessages]);

  // Only scroll when we explicitly want to
  useEffect(() => {
    if (shouldScrollToBottom && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  // Add ENS resolution effect
  useEffect(() => {
    const resolveMessageSenders = async () => {
      const uniqueSenders = Array.from(new Set(messages.map(msg => msg.sender)));
      const newEnsNames: Record<string, string> = {};
      
      for (const sender of uniqueSenders) {
        if (!ensNames[sender]) {
          const ensName = await resolveENS(sender);
          if (ensName && ensName !== sender) {
            newEnsNames[sender] = ensName;
          }
        }
      }
      
      if (Object.keys(newEnsNames).length > 0) {
        setEnsNames(prev => ({ ...prev, ...newEnsNames }));
      }
    };

    if (messages.length > 0) {
      resolveMessageSenders();
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticatedAddress || !newMessage.trim() || !nodeId || !isAuthenticated) {
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
      if (messageToAdd) {
        setMessages(prev => [...prev, messageToAdd]);
        setNewMessage('');
        setShouldScrollToBottom(true);
      }
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

  const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
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
    if (address === authenticatedAddress) return 'You';
    return ensNames[address] || formatAddress(address);
  };

  if (isLoading && messages.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" color="purple.500" />
        <Text mt={4}>Loading chat messages...</Text>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Please connect your wallet to continue</h1>
        <button
          onClick={() => login()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      </div>
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
                  name={getDisplayName(message.sender)} 
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
                        {getDisplayName(message.sender)}
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
              disabled={!authenticatedAddress || isSending || !isMember || !isAuthenticated}
            />
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isSending}
              loadingText="Sending"
              disabled={!authenticatedAddress || !newMessage.trim() || isSending || !isMember || !isAuthenticated}
            >
              Send
            </Button>
          </HStack>
          {!authenticatedAddress && (
            <Text fontSize="sm" color="red.500" mt={2}>
              Please connect your wallet to send messages
            </Text>
          )}
          {authenticatedAddress && !isAuthenticated && (
            <Text fontSize="sm" color="red.500" mt={2}>
              Please authenticate with AppKit to send messages
            </Text>
          )}
          {authenticatedAddress && isAuthenticated && !isMember && (
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
