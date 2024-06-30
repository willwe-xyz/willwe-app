import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Assume NodeState interface is imported or defined here

interface NodeStacksProps {
  stack: NodeState[];
  nodeClick: (nodeId: string) => void;
}

const Accordion = ({ children, title, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-md mt-4">
      <button
        className="flex justify-between w-full px-4 py-2 text-left bg-gray-100 hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`px-4 py-2 ${isOpen ? 'block' : 'hidden'}`}>{children}</div>
    </div>
  );
};

const NodeCard = ({ node, nodeClick, depth = 0 }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${depth > 0 ? 'ml-4' : ''}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Node ID: {node.nodeId}</h3>
      <span className="px-2 py-1 text-sm bg-gray-200 rounded-full">
        {node.membersOfNode?.length || 0} members
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>User Address: {node.userAddress}</div>
      <div>Inflation: {node.inflation}</div>
      <div>Balance Anchor: {node.balanceAnchor}</div>
      <div>Balance Budget: {node.balanceBudget}</div>
      <div>Value: {node.value}</div>
      <div>Membrane ID: {node.membraneId}</div>
    </div>
    {node.childrenNodes && node.childrenNodes.length > 0 && (
      <Accordion title={`Child Nodes (${node.childrenNodes.length})`} defaultOpen={depth === 0}>
        <div className="space-y-4">
          {node.childrenNodes.map((childNode, index) => (
            <NodeCard 
              key={index} 
              node={childNode} 
              nodeClick={nodeClick}
              depth={depth + 1}
            />
          ))}
        </div>
      </Accordion>
    )}
  </div>
);

export const NodeStacks: React.FC<NodeStacksProps> = ({ stack, nodeClick }) => {
  if (!stack || stack.length === 0) {
    return <div className="text-center text-gray-500">No nodes available.</div>;
  }

  return (
    <div className="space-y-4">
      {stack.map((node, index) => (
        <NodeCard key={index} node={node} nodeClick={nodeClick} />
      ))}
    </div>
  );
};

export default NodeStacks;