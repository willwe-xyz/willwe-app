import React from 'react';
import { useColorManagement } from './AllStackComponents';
import NodeViewContainer from './NodeView/NodeViewContainer';

interface NodeViewLayoutProps {
  chainId?: string;
  nodeId?: string;
}

const NodeViewLayout: React.FC<NodeViewLayoutProps> = ({ chainId, nodeId }) => {
  const { colorState, cycleColors } = useColorManagement();

  return (
    <NodeViewContainer
      chainId={chainId}
      nodeId={nodeId}
      colorState={colorState}
      cycleColors={cycleColors}
    />
  );
};

export default NodeViewLayout;