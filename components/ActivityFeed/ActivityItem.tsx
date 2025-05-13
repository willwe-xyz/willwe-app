import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Badge, Icon, Tooltip, HStack, Link } from '@chakra-ui/react';
import { ActivityItem as ActivityItemType } from '../../types/chainData';
import { formatRelativeTime } from '../../utils/timeUtils';
import { Users, ArrowUpRight, ExternalLink } from 'lucide-react';
import { resolveENS } from '../../utils/ensUtils';
import { getExplorerLink } from '../../config/contracts';

interface ActivityItemProps {
  activity: ActivityItemType;
  selectedTokenColor?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity,
  selectedTokenColor = 'blue.500'
}) => {
  const [resolvedAddress, setResolvedAddress] = useState<string>('');

  useEffect(() => {
    const resolveAddress = async () => {
      const resolved = await resolveENS(activity.who);
      setResolvedAddress(resolved);
    };
    resolveAddress();
  }, [activity.who]);

  // Format amount to max 4 decimal places
  const formatAmount = (amount: string) => {
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return amount;
      return num.toFixed(4).replace(/\.?0+$/, '');
    } catch {
      return amount;
    }
  };

  // Shorten node id
  const shortNodeId = `${activity.nodeId.slice(0, 4)}...${activity.nodeId.slice(-6)}`;

  // Get human-friendly action phrase
  let actionPhrase = '';
  if (activity.eventType.toLowerCase() === 'joined') {
    actionPhrase = 'joined node';
  } else if (activity.eventType.toLowerCase() === 'shares generated') {
    actionPhrase = `generated ${formatAmount(activity.amount || '0')} new shares`;
  } else if (activity.eventType.toLowerCase() === 'mint') {
    actionPhrase = `minted ${formatAmount(activity.amount || '0')} tokens`;
  } else if (activity.eventType.toLowerCase() === 'burn') {
    actionPhrase = `burned ${formatAmount(activity.amount || '0')} tokens`;
  } else {
    actionPhrase = activity.description || activity.eventType;
  }

  // Get lowercase label/tag
  const tagLabel = activity.eventType.toLowerCase();

  // Get badge style based on event type
  const getBadgeStyle = (eventType: string) => {
    const baseStyle = {
      bg: `${selectedTokenColor}10`,
      color: selectedTokenColor,
      borderColor: `${selectedTokenColor}30`
    };
    switch (eventType.toLowerCase()) {
      case 'burn':
        return { bg: 'red.50', color: 'red.500', borderColor: 'red.200' };
      case 'mint':
        return { bg: 'green.50', color: 'green.500', borderColor: 'green.200' };
      case 'joined':
        return { bg: 'blue.50', color: 'blue.500', borderColor: 'blue.200' };
      default:
        return baseStyle;
    }
  };

  return (
    <Box 
      p={3}
      borderWidth="1px" 
      borderRadius="lg"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-1px)',
        shadow: 'sm'
      }}
    >
      {/* Top: subject (ENS/address) and time */}
      <Flex justify="space-between" align="flex-start" mb={1}>
        <Link
          href={getExplorerLink(activity.who, activity.networkId)}
          target="_blank"
          rel="noopener noreferrer"
          display="inline-flex"
          alignItems="center"
          gap={1}
          color="inherit"
          _hover={{
            color: selectedTokenColor,
            textDecoration: 'none',
            '& .external-link-icon': {
              opacity: 1
            }
          }}
        >
          <Text fontWeight="bold" fontSize="md">
            {resolvedAddress || `${activity.who.slice(0, 6)}...${activity.who.slice(-4)}`}
          </Text>
          <ExternalLink 
            size={14} 
            className="external-link-icon"
            style={{ 
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out'
            }} 
          />
        </Link>
        <Text fontSize="sm" color={selectedTokenColor} fontWeight="medium">
          {activity.when ? formatRelativeTime(activity.when) : 'Unknown time'}
        </Text>
      </Flex>

      {/* Middle: action phrase */}
      <Text fontSize="sm" fontWeight="medium" mb={0.5}>
        {actionPhrase}
      </Text>

      {/* Node link (shortened) */}
      <Link 
        href={`/nodes/${activity.networkId}/${activity.nodeId}`}
        color={selectedTokenColor}
        fontSize="sm"
        display="inline-flex"
        alignItems="center"
        _hover={{ textDecoration: 'none', color: selectedTokenColor, opacity: 0.8 }}
        mb={2}
      >
        node {shortNodeId}
        <ArrowUpRight size={14} style={{ marginLeft: 4 }} />
      </Link>

      {/* Bottom: tag/label at bottom right */}
      <Flex justify="flex-end" align="center" mt={2}>
        <Badge 
          px={2}
          py={0.5}
          borderRadius="full"
          variant="subtle"
          borderWidth="1px"
          textTransform="lowercase"
          fontWeight="normal"
          fontSize="xs"
          {...getBadgeStyle(activity.eventType)}
        >
          {tagLabel}
        </Badge>
      </Flex>
    </Box>
  );
};
