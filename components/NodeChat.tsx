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
  Tooltip
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { formatDistanceToNow } from 'date-fns';
import { NodeState } from '../types/chainData';
import { usePonderData } from '@/hooks/usePonderData';
import { limits } from 'chroma-js';
import { resolveENS } from '@/utils/ensUtils';

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
  ensName?: string;
}

const NodeChat: React.FC<NodeChatProps> = ({ nodeId, chainId, nodeData, userAddress }) => {
  const { address } = useAccount();
  const { authenticated, user } = usePrivy();
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
  
  const authenticatedAddress = user?.wallet?.address || address;
  const isMember = userAddress ? nodeData?.membersOfNode?.includes(userAddress) : false;
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Cleanup function
  useEffect(() => {
    isMountedRef.current = true;
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
      if (lastMessageIdRef.current && latestMessageId === lastMessageIdRef.current) {
        console.log('fetchMessages: skipping setMessages, already up to date', { lastMessageId: lastMessageIdRef.current, latestMessageId });
        return; // No new messages, don't update state
      }
      // Debug log before isMountedRef check
      console.log('fetchMessages: about to check isMountedRef, sortedMessages:', sortedMessages, 'lastMessageIdRef:', lastMessageIdRef.current, 'latestMessageId:', latestMessageId);
      if (isMountedRef.current) {
        setMessages(sortedMessages);
        lastMessageIdRef.current = latestMessageId;
        console.log('fetchMessages: setMessages called with', sortedMessages);
        // Only scroll to bottom if we were already at the bottom
        const container = messagesContainerRef.current;
        const wasAtBottom = container ? 
          container.scrollHeight - container.scrollTop === container.clientHeight : 
          true;
        if (wasAtBottom) {
          setShouldScrollToBottom(true);
        }
      }
    } catch (error) {
      // Don't show error toast for 404s or when the server is not available
      console.error('fetchMessages: error caught', error);
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
      
      // Handle different response formats from the Ponder server
      const messageToAdd = result;
      if (messageToAdd) {
        setMessages(prev => [...prev, messageToAdd]);
        setNewMessage('');
        setShouldScrollToBottom(true);
      }
    } catch (error) {
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

  const getDisplayName = (address: string) => {
    if (address === authenticatedAddress) return 'You';
    return ensNames[address] || formatAddress(address);
  };

  // Debug log to check messages at render time
  console.log('NodeChat render: messages.length =', messages.length, messages);

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
