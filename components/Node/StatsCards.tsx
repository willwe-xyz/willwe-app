import React from 'react';
import {
  Box,
  HStack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<LucideIcon>;
  color: string;
  tooltip: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  tooltip,
  size = 'sm'
}) => {
  const padding = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const titleSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md';
  const valueSize = size === 'sm' ? 'lg' : size === 'md' ? 'xl' : '2xl';

  return (
    <Tooltip label={tooltip}>
      <Box
        p={padding}
        bg={`${color}.50`}
        rounded="lg"
        border="1px solid"
        borderColor={`${color}.100`}
        transition="all 0.2s"
        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        minW="150px"
      >
        <HStack color={`${color}.600`} mb={1} spacing={2}>
          {React.cloneElement(icon, { size: size === 'sm' ? 14 : 16 })}
          <Text fontSize={titleSize} fontWeight="medium">
            {title}
          </Text>
        </HStack>
        <Text 
          fontSize={valueSize} 
          fontWeight="bold"
          color={`${color}.900`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
      </Box>
    </Tooltip>
  );
};