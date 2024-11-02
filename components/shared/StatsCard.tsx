import React from 'react';
import { Box, HStack, Text, Tooltip } from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  tooltip: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
  tooltip
}) => (
  <Tooltip label={tooltip}>
    <Box
      p={4}
      bg={bgColor}
      rounded="lg"
      flex="1"
      minW="200px"
      role="group"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md'
      }}
    >
      <HStack color={textColor} mb={1}>
        <Icon size={16} />
        <Text fontSize="sm">{title}</Text>
      </HStack>
      <Text fontSize="2xl" fontWeight="semibold">
        {value}
      </Text>
    </Box>
  </Tooltip>
);

export default StatsCard;