import React, { useState, useEffect, useRef } from 'react';
import { usePonderData } from '../hooks/usePonderData';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';

interface NodeChatProps {
  nodeId: string;
}

export default function NodeChat({ nodeId }: NodeChatProps) {
  const { address } = useAccount();
  const { getNodeChatMessages, sendChatMessage, isLoading, error } = usePonderData();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on component mount and when nodeId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (nodeId) {
        const data = await getNodeChatMessages(nodeId, 50);
        setMessages(data || []);
      }
    };

    fetchMessages();
    
    // Set up real-time subscription for new messages
    const setupSubscription = async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const subscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `node_id=eq.${nodeId}`
        }, (payload) => {
          // Add new message to the list
          setMessages(prev => [payload.new, ...prev]);
        })
        .subscribe();
      
      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupSubscription();
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
      return 'Unknown time';
    }
  };

  if (isLoading && messages.length === 0) {
    return <div className="p-4 text-center">Loading chat messages...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading chat: {error.message}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Node Chat</h2>
        <p className="text-sm text-gray-500">Discuss with other members of this node</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Be the first to start the conversation!
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={message.id || index} 
              className={`flex ${message.sender === address ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === address 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="text-sm mb-1">
                  {message.sender === address ? 'You' : formatAddress(message.sender)}
                </div>
                <div className="break-words">{message.content}</div>
                <div className={`text-xs mt-1 ${message.sender === address ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!address || isSending}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            disabled={!address || !newMessage.trim() || isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {!address && (
          <p className="text-sm text-red-500 mt-2">
            Please connect your wallet to send messages
          </p>
        )}
      </form>
    </div>
  );
}
