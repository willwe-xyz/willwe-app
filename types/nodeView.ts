export interface ColorState {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  }
  
  export interface NodeViewProps {
    chainId?: string;
    nodeId?: string;
    colorState: ColorState;
    cycleColors: () => void;
  }
  
  export interface ServerSideProps {
    initialChainId: string | null;
    initialNodeId: string | null;
  }