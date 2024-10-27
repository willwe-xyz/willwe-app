import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { NodeState, UserContext } from '../types/chainData';
import { useRouter } from 'next/router';

interface NodeContextState {
  selectedNodeId: string | null;
  selectedToken: string | null;
  nodeData: NodeState | null;
  userContext: UserContext | null;
  isLoading: boolean;
  error: Error | null;
}

interface NodeContextValue extends NodeContextState {
  selectNode: (nodeId: string, chainId: string) => void;
  selectToken: (tokenAddress: string) => void;
  updateNodeData: (data: NodeState) => void;
  clearNodeSelection: () => void;
}

const initialState: NodeContextState = {
  selectedNodeId: null,
  selectedToken: null,
  nodeData: null,
  userContext: null,
  isLoading: false,
  error: null,
};

type NodeAction =
  | { type: 'SELECT_NODE'; payload: string }
  | { type: 'SELECT_TOKEN'; payload: string }
  | { type: 'SET_NODE_DATA'; payload: NodeState }
  | { type: 'SET_USER_CONTEXT'; payload: UserContext }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_SELECTION' };

function nodeReducer(state: NodeContextState, action: NodeAction): NodeContextState {
  switch (action.type) {
    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
        selectedToken: null,
      };
    case 'SELECT_TOKEN':
      return {
        ...state,
        selectedToken: action.payload,
        selectedNodeId: null,
      };
    case 'SET_NODE_DATA':
      return {
        ...state,
        nodeData: action.payload,
      };
    case 'SET_USER_CONTEXT':
      return {
        ...state,
        userContext: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedNodeId: null,
        selectedToken: null,
        nodeData: null,
      };
    default:
      return state;
  }
}

const NodeContext = createContext<NodeContextValue | undefined>(undefined);

export function NodeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(nodeReducer, initialState);
  const router = useRouter();

  const selectNode = useCallback((nodeId: string, chainId: string) => {
    dispatch({ type: 'SELECT_NODE', payload: nodeId });
    router.push(`/nodes/${chainId}/${nodeId}`, undefined, { shallow: true });
  }, [router]);

  const selectToken = useCallback((tokenAddress: string) => {
    dispatch({ type: 'SELECT_TOKEN', payload: tokenAddress });
  }, []);

  const updateNodeData = useCallback((data: NodeState) => {
    dispatch({ type: 'SET_NODE_DATA', payload: data });
  }, []);

  const clearNodeSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  return (
    <NodeContext.Provider
      value={{
        ...state,
        selectNode,
        selectToken,
        updateNodeData,
        clearNodeSelection,
      }}
    >
      {children}
    </NodeContext.Provider>
  );
}

export function useNode() {
  const context = useContext(NodeContext);
  if (context === undefined) {
    throw new Error('useNode must be used within a NodeProvider');
  }
  return context;
}