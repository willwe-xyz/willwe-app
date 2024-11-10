import React from 'react';
import { Grid, Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { Activity, Users, GitBranch, Signal } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalValue: bigint;
    totalMembers: number;
    totalSignals: number;
    avgValue: string;
  };
  color: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, color }) => {
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue(`${color}20`, `${color}40`);
  
  const cards = [
    {
      label: 'Total Value',
      value: stats.totalValue.toString(),
      icon: Activity,
      subtitle: `Average: ${stats.avgValue}`
    },
    {
      label: 'Total Members',
      value: stats.totalMembers.toString(),
      icon: Users,
      subtitle: 'Active participants'
    },
    {
      label: 'Active Signals',
      value: stats.totalSignals.toString(),
      icon: Signal,
      subtitle: 'Pending distributions'
    },
    {
      label: 'Token Flow',
      value: `${(Number(stats.avgValue) / Number(stats.totalValue) * 100).toFixed(2)}%`,
      icon: GitBranch,
      subtitle: 'Distribution rate'
    }
  ];

  return (
    <Grid 
      templateColumns={{ 
        base: "1fr", 
        md: "repeat(2, 1fr)", 
        lg: "repeat(4, 1fr)" 
      }}
      gap={4}
      mb={8}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Box
            key={index}
            bg={bgColor}
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            transition="all 0.2s"
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'md',
              borderColor: color
            }}
          >
            <HStack color={color} mb={2} spacing={3}>
              <Icon size={20} />
              <Text fontSize="sm" fontWeight="medium">
                {card.label}
              </Text>
            </HStack>

            <Text 
              fontSize="2xl" 
              fontWeight="bold"
              mb={1}
            >
              {card.value}
            </Text>

            <Text 
              fontSize="xs" 
              color="gray.500"
            >
              {card.subtitle}
            </Text>
          </Box>
        );
      })}
    </Grid>
  );
};

export default StatsCards;