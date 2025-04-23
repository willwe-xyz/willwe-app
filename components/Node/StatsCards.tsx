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
  valueSize?: string;
  decimalSize?: string;
  maxDecimals?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  tooltip,
  size = 'sm',
  valueSize,
  decimalSize,
  maxDecimals
}) => {
  const padding = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const titleSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md';
  const defaultValueSize = size === 'sm' ? 'lg' : size === 'md' ? 'xl' : '2xl';

  const formattedValue = (() => {
    // Convert to number for comparison
    const numValue = typeof value === 'number' ? value : Number(value);
    
    // Handle very small values
    if (numValue > 0 && numValue < 0.0001) {
      return '0.0001';
    }
    
    // Format normally
    if (typeof value === 'number' && maxDecimals !== undefined) {
      return value.toFixed(maxDecimals);
    }
    return typeof value === 'string' && value.includes('.')
      ? value
      : value.toString();
  })();

  // Split number into whole and decimal parts
  const [wholePart, decimalPart] = formattedValue.split('.');

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
        <HStack color={`${color}.600`} mb={1} spacing={2} justify="center">
          {React.cloneElement(icon as React.ReactElement<any>, { 
            style: { width: size === 'sm' ? 14 : 16, height: size === 'sm' ? 14 : 16 } 
          })}
          <Text fontSize={titleSize} fontWeight="medium">
            {title}
          </Text>
        </HStack>
        <Text 
          fontSize={valueSize || defaultValueSize} 
          fontWeight="bold"
          color={`${color}.900`}
          textAlign="right"
        >
          {wholePart}
          {decimalPart && (
            <Text
              as="span"
              fontSize={decimalSize || '97.5%'}
              color={`${color}.500`}
              ml="1px"
            >
              .{decimalPart}
            </Text>
          )}
        </Text>
      </Box>
    </Tooltip>
  );
};