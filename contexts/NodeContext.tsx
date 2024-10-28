import React, { createContext, useContext, useState, useCallback } from 'react';

interface NodeContextType {
  selectedToken: string;
  selectedNodeId: string | null;
  selectToken: (tokenAddress: string) => void;
  selectNode: (nodeId: string, chainId: string) => void;
  clearNodeSelection: () => void;
}

const NodeContext = createContext<NodeContextType>({
  selectedToken: '',
  selectedNodeId: null,
  selectToken: () => {},
  selectNode: () => {},
  clearNodeSelection: () => {}
});

export const useNode = () => useContext(NodeContext);

interface NodeProviderProps {
  children: React.ReactNode;
}

export const NodeProvider: React.FC<NodeProviderProps> = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectToken = useCallback((tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setSelectedNodeId(null); // Clear selected node when selecting a token
  }, []);

  const selectNode = useCallback((nodeId: string, chainId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const clearNodeSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <NodeContext.Provider
      value={{
        selectedToken,
        selectedNodeId,
        selectToken,
        selectNode,
        clearNodeSelection
      }}
    >
      {children}
    </NodeContext.Provider>
  );
};