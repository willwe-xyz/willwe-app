// import React, { useState, useEffect, useCallback } from 'react';
// import { Grid, GridItem, Box, Text, useEventListener } from '@chakra-ui/react';
// import { NodeState } from '../lib/chainData';
// import NodeDetails from './NodeDetails';

// interface NodeNavigationGridProps {
//   nodes: NodeState[];
//   selectedNode: NodeState | null;
//   onNodeSelect: (nodeId: string) => void;
// }

// const NodeNavigationGrid: React.FC<NodeNavigationGridProps> = ({ nodes, selectedNode, onNodeSelect }) => {
//   const [focusedNodeIndex, setFocusedNodeIndex] = useState<number>(0);

//   useEffect(() => {
//     if (selectedNode) {
//       const index = nodes.findIndex(node => node.basicInfo[0] === selectedNode.basicInfo[0]);
//       if (index !== -1) setFocusedNodeIndex(index);
//     }
//   }, [selectedNode, nodes]);

//   const handleKeyDown = useCallback((event: KeyboardEvent) => {
//     const gridSize = Math.ceil(Math.sqrt(nodes.length));
//     let newIndex = focusedNodeIndex;

//     switch (event.key) {
//       case 'ArrowUp':
//         newIndex = Math.max(0, focusedNodeIndex - gridSize);
//         break;
//       case 'ArrowDown':
//         newIndex = Math.min(nodes.length - 1, focusedNodeIndex + gridSize);
//         break;
//       case 'ArrowLeft':
//         newIndex = Math.max(0, focusedNodeIndex - 1);
//         break;
//       case 'ArrowRight':
//         newIndex = Math.min(nodes.length - 1, focusedNodeIndex + 1);
//         break;
//       case 'Enter':
//         onNodeSelect(nodes[focusedNodeIndex].basicInfo[0]);
//         return;
//     }

//     if (newIndex !== focusedNodeIndex) {
//       setFocusedNodeIndex(newIndex);
//       onNodeSelect(nodes[newIndex].basicInfo[0]);
//     }
//   }, [focusedNodeIndex, nodes, onNodeSelect]);

//   useEventListener('keydown', handleKeyDown);

//   const gridSize = Math.ceil(Math.sqrt(nodes.length));

//   return (
//     <Box p={4}>
//       <Grid templateColumns={`repeat(${gridSize}, 1fr)`} gap={4}>
//         {nodes.map((node, index) => (
//           <GridItem 
//             key={node.basicInfo[0]}
//             bg={index === focusedNodeIndex ? 'blue.100' : 'gray.100'}
//             p={2}
//             borderRadius="md"
//             cursor="pointer"
//             onClick={() => {
//               setFocusedNodeIndex(index);
//               onNodeSelect(node.basicInfo[0]);
//             }}
//           >
//             <Text fontWeight="bold">{node.basicInfo[0]}</Text>
//             <Text fontSize="sm">Value: {node.basicInfo[4]}</Text>
//           </GridItem>
//         ))}
//       </Grid>
//       {selectedNode && (
//         <Box mt={4}>
//           <NodeDetails
//             node={selectedNode}
//             chainId={selectedNode.basicInfo[0].split('-')[0]}
//             onNodeSelect={onNodeSelect}
//           />
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default NodeNavigationGrid;