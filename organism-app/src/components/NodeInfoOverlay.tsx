import React from 'react'
import { NodeData } from '../types/nodeData'

interface NodeInfoOverlayProps {
  selectedNode: NodeData | null
  onClose: () => void
  position: { x: number; y: number }
}

export const NodeInfoOverlay: React.FC<NodeInfoOverlayProps> = ({ 
  selectedNode, 
  onClose, 
  position 
}) => {
  if (!selectedNode) return null
  
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`
    }
    return value.toString()
  }
  
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x + 10}px`,
    top: `${position.y + 10}px`,
    background: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #333',
    maxWidth: '300px',
    zIndex: 1000,
    fontFamily: 'monospace',
    fontSize: '12px'
  }
  
  return (
    <div style={overlayStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#00ff88' }}>Node Information</h3>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <strong>Node ID:</strong><br />
          <span style={{ fontSize: '10px', color: '#aaa' }}>
            {selectedNode.basicInfo[0].slice(0, 8)}...
          </span>
        </div>
        
        <div>
          <strong>Hierarchy:</strong><br />
          <span style={{ color: '#88ff88' }}>
            Level {selectedNode.hierarchyDepth || 0}
          </span>
        </div>
        
        <div>
          <strong>Total Supply:</strong><br />
          <span style={{ color: '#ffff88' }}>
            {formatNumber(selectedNode.basicInfo[11])}
          </span>
        </div>
        
        <div>
          <strong>Inflation Rate:</strong><br />
          <span style={{ color: '#ff8888' }}>
            {selectedNode.basicInfo[1]} gwei/s
          </span>
        </div>
        
        <div>
          <strong>Budget:</strong><br />
          <span style={{ color: '#88ffff' }}>
            {formatNumber(selectedNode.basicInfo[3])}
          </span>
        </div>
        
        <div>
          <strong>Reserve:</strong><br />
          <span style={{ color: '#ff88ff' }}>
            {formatNumber(selectedNode.basicInfo[2])}
          </span>
        </div>
        
        <div>
          <strong>Members:</strong><br />
          <span style={{ color: '#8888ff' }}>
            {selectedNode.membersOfNode.length}
          </span>
        </div>
        
        <div>
          <strong>Children:</strong><br />
          <span style={{ color: '#88ff88' }}>
            {selectedNode.childrenNodes.length}
          </span>
        </div>
      </div>
      
      {selectedNode.childrenNodes.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <strong>Child Nodes:</strong>
          <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '4px' }}>
            {selectedNode.childrenNodes.slice(0, 5).map((childId, index) => (
              <div key={childId} style={{ fontSize: '10px', color: '#aaa' }}>
                {index + 1}. {childId.slice(0, 12)}...
              </div>
            ))}
            {selectedNode.childrenNodes.length > 5 && (
              <div style={{ fontSize: '10px', color: '#666' }}>
                +{selectedNode.childrenNodes.length - 5} more...
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '12px', fontSize: '10px', color: '#666' }}>
        <strong>Membrane Complex:</strong> {selectedNode.basicInfo[6]}<br />
        <strong>User Balance:</strong> {formatNumber(selectedNode.basicInfo[9])}<br />
        <strong>Root Token:</strong> {selectedNode.rootTokenAddress.slice(0, 8)}...
      </div>
    </div>
  )
}