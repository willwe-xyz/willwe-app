import React, { useState, useEffect, useRef } from 'react'
import { CelestialBody } from '../../types/solarSystem'
import { useWillWeIntegration } from '../../hooks/useWillWeIntegration'

interface ChatMessage {
  id: string
  nodeId: string
  sender: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'proposal'
  metadata?: {
    txHash?: string
    proposalId?: string
  }
}

interface ChatPanelProps {
  selectedBody: CelestialBody
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  selectedBody,
  onSuccess,
  onError
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { account, canInteract } = useWillWeIntegration()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load initial chat messages for the selected celestial body
  useEffect(() => {
    loadChatHistory()
    // In a real implementation, this would establish WebSocket connection
    const cleanup = simulateConnection()
    return cleanup
  }, [selectedBody.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadChatHistory = async () => {
    setIsLoading(true)
    try {
      // Mock chat history - in real implementation, fetch from backend/IPFS
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          nodeId: selectedBody.nodeData.basicInfo[0],
          sender: 'System',
          content: `Welcome to ${selectedBody.type} ${selectedBody.id.slice(0, 8)}... governance chat`,
          timestamp: Date.now() - 3600000,
          type: 'system'
        },
        {
          id: '2',
          nodeId: selectedBody.nodeData.basicInfo[0],
          sender: '0xabc123...',
          content: 'I propose we increase the inflation rate to support new members',
          timestamp: Date.now() - 1800000,
          type: 'text'
        },
        {
          id: '3',
          nodeId: selectedBody.nodeData.basicInfo[0],
          sender: '0xdef456...',
          content: 'Good idea! This would help with liquidity during expansion',
          timestamp: Date.now() - 900000,
          type: 'text'
        },
        {
          id: '4',
          nodeId: selectedBody.nodeData.basicInfo[0],
          sender: 'System',
          content: 'Movement #123 has been created: Update inflation parameters',
          timestamp: Date.now() - 600000,
          type: 'system',
          metadata: { proposalId: '123' }
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      onError?.('Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateConnection = () => {
    // Simulate WebSocket connection
    setTimeout(() => setIsConnected(true), 1000)
    
    // Simulate occasional system messages
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const systemMessages = [
          'New member joined the governance chat',
          'Voting period for movement #124 has ended',
          'Membrane requirements updated',
          'Token redistribution completed'
        ]
        
        const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)]
        addSystemMessage(randomMessage)
      }
    }, 30000)

    return () => clearInterval(interval)
  }

  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      nodeId: selectedBody.nodeData.basicInfo[0],
      sender: 'System',
      content,
      timestamp: Date.now(),
      type: 'system'
    }
    setMessages(prev => [...prev, systemMessage])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !canInteract) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      nodeId: selectedBody.nodeData.basicInfo[0],
      sender: account || 'Unknown',
      content: newMessage.trim(),
      timestamp: Date.now(),
      type: 'text'
    }

    try {
      setIsLoading(true)
      
      // In real implementation, send to backend/IPFS
      setMessages(prev => [...prev, message])
      setNewMessage('')
      onSuccess?.('Message sent successfully')

      // Simulate response delay
      setTimeout(() => {
        if (Math.random() < 0.3) { // 30% chance of getting a response
          const responses = [
            'Interesting perspective!',
            'I agree with this proposal',
            'We should consider the economic implications',
            'Let\'s put this to a vote',
            'Good point, thanks for sharing'
          ]
          
          const response: ChatMessage = {
            id: (Date.now() + 1).toString(),
            nodeId: selectedBody.nodeData.basicInfo[0],
            sender: '0x' + Math.random().toString(16).slice(2, 8) + '...',
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: Date.now() + 1000,
            type: 'text'
          }
          setMessages(prev => [...prev, response])
        }
      }, 2000 + Math.random() * 3000)

    } catch (error) {
      onError?.('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const formatSender = (sender: string) => {
    if (sender === 'System') return sender
    if (sender === account) return 'You'
    return sender.length > 10 ? `${sender.slice(0, 6)}...${sender.slice(-4)}` : sender
  }

  const getMessageIcon = (message: ChatMessage) => {
    switch (message.type) {
      case 'system': return '🤖'
      case 'proposal': return '📋'
      case 'text': return message.sender === account ? '💬' : '👤'
      default: return '💬'
    }
  }

  if (!canInteract) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔒</div>
            <h4 className="text-white font-medium mb-2">Wallet Required</h4>
            <p className="text-gray-400 text-sm">
              Connect your wallet to participate in governance chat
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-80">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <span className="text-lg">
            {selectedBody.type === 'sun' ? '☀️' : 
             selectedBody.type === 'planet' ? '🪐' : '🌙'}
          </span>
          <div>
            <h4 className="text-white font-medium text-sm">
              {selectedBody.type.charAt(0).toUpperCase() + selectedBody.type.slice(1)} Chat
            </h4>
            <p className="text-gray-400 text-xs">
              {selectedBody.nodeData.membersOfNode.length} members
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-48">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.sender === account ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="flex-shrink-0 text-sm">
                {getMessageIcon(message)}
              </div>
              
              <div className={`flex-1 ${message.sender === account ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-xs p-2 rounded-lg text-sm ${
                  message.type === 'system'
                    ? 'bg-blue-600/20 border border-blue-400/40 text-blue-300'
                    : message.sender === account
                    ? 'bg-green-600/20 border border-green-400/40 text-green-300'
                    : 'bg-white/10 border border-white/20 text-white'
                }`}>
                  {message.type !== 'system' && (
                    <div className="text-xs text-gray-400 mb-1">
                      {formatSender(message.sender)}
                    </div>
                  )}
                  <div>{message.content}</div>
                  {message.metadata?.proposalId && (
                    <div className="text-xs text-blue-400 mt-1">
                      Movement #{message.metadata.proposalId}
                    </div>
                  )}
                </div>
                
                <div className={`text-xs text-gray-500 mt-1 ${
                  message.sender === account ? 'text-right' : 'text-left'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-white/20">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message this ${selectedBody.type}...`}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !newMessage.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-800 transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              '📤'
            )}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}

export default ChatPanel