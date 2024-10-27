import React from 'react';
import { Box, Text, HStack, VStack, useToken } from '@chakra-ui/react';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatBalance } from '../hooks/useBalances';

interface TokenActivityProps {
  tokenAddress: string;
  tokenSymbol: string;
  lastActivity?: {
    type: 'mint' | 'burn' | 'transfer' | 'signal';
    timestamp: number;
    amount: string;
  };
  recentActivities: {
    type: 'mint' | 'burn' | 'transfer' | 'signal';
    timestamp: number;
    amount: string;
  }[];
  contrastingColor: string;
}

export const TokenActivity: React.FC<TokenActivityProps> = ({
  tokenAddress,
  tokenSymbol,
  lastActivity,
  recentActivities,
  contrastingColor,
}) => {
  const [baseColor] = useToken('colors', [contrastingColor]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <ArrowUpRight size={16} />;
      case 'burn':
        return <ArrowDownRight size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!lastActivity) return null;

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      width="100%"
      p={2}
      backgroundColor={`${baseColor}10`}
      borderBottomRadius="md"
    >
      <VStack align="stretch" spacing={2}>
        {/* Last Activity */}
        <HStack justify="space-between">
          <HStack spacing={1}>
            {getActivityIcon(lastActivity.type)}
            <Text fontSize="xs" fontWeight="medium">
              {lastActivity.type.toUpperCase()}
            </Text>
          </HStack>
          <Text fontSize="xs" opacity={0.8}>
            {getTimeAgo(lastActivity.timestamp)}
          </Text>
        </HStack>

        {/* Recent Activity Summary */}
        {recentActivities.length > 0 && (
          <Box>
            <Text fontSize="xs" opacity={0.8}>
              {recentActivities.length} activities in the last 24h
            </Text>
            <Box
              width="100%"
              height="2px"
              mt={1}
              background={`linear-gradient(to right, ${baseColor}40, ${baseColor}10)`}
            >
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  position="absolute"
                  height="4px"
                  width="2px"
                  bottom={0}
                  left={`${(index / recentActivities.length) * 100}%`}
                  backgroundColor={baseColor}
                  opacity={0.6}
                />
              ))}
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default React.memo(TokenActivity);