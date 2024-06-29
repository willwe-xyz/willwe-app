import React from 'react';
import { HStack, Box, Text } from "@chakra-ui/react";

interface SubNodesProps {
  chNodes: string[];
  handleNodeClick: (nodeId: string) => void;
  stackid: string;
}

export const SubNodes: React.FC<SubNodesProps> = ({ chNodes, handleNodeClick, stackid }) => {
  return (
    <HStack
      spacing={4}
      overflowX="auto"
      py={2}
      sx={{
        '&::-webkit-scrollbar': {
          height: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      }}
    >
      {chNodes?.length > 0 ? (
        chNodes.map((child) => (
          <Box
            key={child}
            onClick={() => handleNodeClick(child)}
            _hover={{ backgroundColor: "gray.200", cursor: "pointer" }}
            p={2}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Text fontSize="sm">{child}</Text>
          </Box>
        ))
      ) : (
        <Text color="gray.500">No children nodes available for {stackid}</Text>
      )}
    </HStack>
  );
};