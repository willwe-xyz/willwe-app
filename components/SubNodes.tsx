import { Box, HStack, Text } from "@chakra-ui/react";

interface SubNodesProps {
  chNodes: string[];
  handleNodeClick: (nodeId: string) => void;
}

const SubNodes: React.FC<SubNodesProps> = ({ chNodes = [], handleNodeClick }) => {
  return (
    <HStack
      overflowX="auto"
      spacing={4}
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
      {chNodes.length > 0 ? (
        chNodes.map((child) => (
          <Box
            key={child}  // Use the child ID as the key
            onClick={() => handleNodeClick(child)}
            _hover={{ backgroundColor: 'gray.200' }}
            _selected={{ bg: 'gray.200' }}
            p={2}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Text fontSize="sm" color="gray.500">
              {child}
            </Text>
          </Box>
        ))
      ) : (
        <Text>No children nodes available</Text>
      )}
    </HStack>
  );
};

export default SubNodes;
