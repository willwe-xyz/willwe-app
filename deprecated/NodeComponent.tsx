import { motion } from 'framer-motion';
interface NodeState {
    nodeId: string;
    userAddress: string;
    inflation: number;
    balanceAnchor: number;
    balanceBudget: number;
    value: number;
    membraneId: string;
    membersOfNode?: string[];
    childrenNodes?: NodeState[];
  }
  

const NodeComponent: React.FC<{ 
    node: NodeState, 
    depth: number, 
    maxWidth: number,
    parentColor: string,
    nodeClick: (nodeId: string) => void
  }> = ({ node, depth, maxWidth, parentColor, nodeClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    if (!node || typeof node !== 'object') {
      console.error('Invalid node data:', node);
      return null;
    }
  
    const color = colorFromString(node.nodeId);
    const width = Math.max(30, (node.balanceAnchor / (node.membersOfNode?.length || 1)) / maxWidth * 300);
    const intensity = Math.min(1, (node.membersOfNode?.length || 1) / 100);
  
    return (
      <motion.div
        className="relative m-1"
        style={{ 
          width: `${width}px`,
          height: '30px',
          backgroundColor: `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},${intensity})`,
          border: `2px solid ${parentColor}`
        }}
        whileHover={{ scale: 1.1, zIndex: 10 }}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        onClick={() => nodeClick(node.nodeId)}
      >
        {isExpanded && (
          <motion.div
            className="absolute p-2 bg-white border rounded shadow-lg z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '20vw', left: '100%', top: 0 }}
          >
            <h3>Node ID: {node.nodeId}</h3>
            <p>Balance Anchor: {node.balanceAnchor}</p>
            <p>Value: {node.value}</p>
            <p>Members: {node.membersOfNode?.length || 0}</p>
            <p>User Address: {node.userAddress}</p>
            <p>Inflation: {node.inflation}</p>
            <p>Balance Budget: {node.balanceBudget}</p>
            <p>Membrane ID: {node.membraneId}</p>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsExpanded(false); 
              }} 
              className="absolute top-0 right-0 p-1"
            >
              ×
            </button>
          </motion.div>
        )}
        {node.childrenNodes && node.childrenNodes.length > 0 && (
          <div className="absolute w-full" style={{ top: '100%' }}>
            <NodeRow 
              nodes={node.childrenNodes} 
              depth={depth + 1} 
              parentColor={color} 
              nodeClick={nodeClick} 
            />
          </div>
        )}
      </motion.div>
    );
  };
  
  export const NodeRow: React.FC<{ 
    nodes: NodeState[], 
    depth: number, 
    parentColor: string,
    nodeClick: (nodeId: string) => void
  }> = ({ nodes, depth, parentColor, nodeClick }) => {
    const maxWidth = Math.max(...nodes.map(n => n.balanceAnchor / (n.membersOfNode?.length || 1)));
    
    return (
      <div className="flex flex-wrap justify-start items-start" style={{ marginLeft: `${depth * 20}px` }}>
        {nodes.map(node => (
          <NodeComponent 
            key={node.nodeId} 
            node={node} 
            depth={depth} 
            maxWidth={maxWidth} 
            parentColor={parentColor} 
            nodeClick={nodeClick}
          />
        ))}
      </div>
    );
  };