import { OnchainDataFetcher } from './onchainData';
import { NodeData } from '../types/nodeData';

export interface NavigationArea {
  id: string;
  name: string;
  nodeIds: string[];
  userTokenBalance: number;
  accessLevel: 'owner' | 'member' | 'visitor';
}

export interface UserNavigationData {
  userAddress: string;
  ownedNodes: NavigationArea[];
  memberNodes: NavigationArea[];
  accessibleNodes: NavigationArea[];
  currentArea: NavigationArea | null;
}

export class TokenBasedNavigation {
  private dataFetcher: OnchainDataFetcher;
  private userAddress: string | null = null;
  private navigationData: UserNavigationData | null = null;

  constructor(dataFetcher: OnchainDataFetcher) {
    this.dataFetcher = dataFetcher;
  }

  async setUserAddress(address: string): Promise<void> {
    this.userAddress = address;
    await this.refreshUserNavigation();
  }

  async refreshUserNavigation(): Promise<UserNavigationData | null> {
    if (!this.userAddress) return null;

    try {
      // Fetch user's nodes - this would require additional contract methods
      // For now, we'll use a mock implementation
      const userNodes = await this.dataFetcher.fetchUserNodes(this.userAddress);
      
      const ownedNodes: NavigationArea[] = [];
      const memberNodes: NavigationArea[] = [];
      const accessibleNodes: NavigationArea[] = [];

      // Process each node the user has access to
      for (const nodeId of userNodes) {
        const nodeData = await this.dataFetcher.fetchNodeData(nodeId);
        const userBalance = await this.dataFetcher.fetchUserBalance(this.userAddress, nodeId);
        const isMember = await this.dataFetcher.isUserMember(this.userAddress, nodeId);

        const area: NavigationArea = {
          id: nodeId,
          name: this.generateAreaName(nodeData),
          nodeIds: [nodeId, ...nodeData.childrenNodes],
          userTokenBalance: userBalance,
          accessLevel: this.determineAccessLevel(nodeData, userBalance, isMember)
        };

        if (area.accessLevel === 'owner') {
          ownedNodes.push(area);
        } else if (area.accessLevel === 'member') {
          memberNodes.push(area);
        } else {
          accessibleNodes.push(area);
        }
      }

      this.navigationData = {
        userAddress: this.userAddress,
        ownedNodes,
        memberNodes,
        accessibleNodes,
        currentArea: null
      };

      return this.navigationData;
    } catch (error) {
      console.error('Error refreshing user navigation:', error);
      return null;
    }
  }

  private generateAreaName(nodeData: NodeData): string {
    const nodeId = nodeData.basicInfo[0];
    const depth = nodeData.hierarchyDepth || 0;
    
    // Generate galaxy/area names based on hierarchy
    const galaxyNames = ['Origin', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
    const areaNames = ['Core', 'Rim', 'Outer', 'Edge', 'Void', 'Nexus', 'Hub', 'Sector', 'Zone'];
    
    const galaxyIndex = parseInt(nodeId.slice(-2), 16) % galaxyNames.length;
    const areaIndex = parseInt(nodeId.slice(-4, -2), 16) % areaNames.length;
    
    if (depth === 0) {
      return `${galaxyNames[galaxyIndex]} Galaxy`;
    } else {
      return `${areaNames[areaIndex]} ${galaxyNames[galaxyIndex]}`;
    }
  }

  private determineAccessLevel(nodeData: NodeData, userBalance: number, isMember: boolean): 'owner' | 'member' | 'visitor' {
    const totalSupply = nodeData.basicInfo[11];
    const ownershipThreshold = totalSupply * 0.1; // 10% for owner status
    
    if (userBalance >= ownershipThreshold) {
      return 'owner';
    } else if (isMember) {
      return 'member';
    } else {
      return 'visitor';
    }
  }

  async navigateToArea(areaId: string): Promise<NodeData[]> {
    if (!this.navigationData) return [];

    const area = this.findAreaById(areaId);
    if (!area) return [];

    this.navigationData.currentArea = area;
    
    // Fetch all nodes in the area
    const nodeDataPromises = area.nodeIds.map(nodeId => 
      this.dataFetcher.fetchNodeData(nodeId).catch(() => null)
    );
    
    const nodeDataResults = await Promise.all(nodeDataPromises);
    return nodeDataResults.filter(Boolean) as NodeData[];
  }

  private findAreaById(areaId: string): NavigationArea | null {
    if (!this.navigationData) return null;

    const allAreas = [
      ...this.navigationData.ownedNodes,
      ...this.navigationData.memberNodes,
      ...this.navigationData.accessibleNodes
    ];

    return allAreas.find(area => area.id === areaId) || null;
  }

  getNavigationData(): UserNavigationData | null {
    return this.navigationData;
  }

  getCurrentArea(): NavigationArea | null {
    return this.navigationData?.currentArea || null;
  }

  getUserAddress(): string | null {
    return this.userAddress;
  }

  async canUserAccessNode(nodeId: string): Promise<boolean> {
    if (!this.userAddress) return false;

    try {
      const isMember = await this.dataFetcher.isUserMember(this.userAddress, nodeId);
      const userBalance = await this.dataFetcher.fetchUserBalance(this.userAddress, nodeId);
      
      return isMember || userBalance > 0;
    } catch (error) {
      console.error('Error checking user access:', error);
      return false;
    }
  }

  async getAreasByAccessLevel(accessLevel: 'owner' | 'member' | 'visitor'): Promise<NavigationArea[]> {
    if (!this.navigationData) return [];

    switch (accessLevel) {
      case 'owner':
        return this.navigationData.ownedNodes;
      case 'member':
        return this.navigationData.memberNodes;
      case 'visitor':
        return this.navigationData.accessibleNodes;
      default:
        return [];
    }
  }
}

// Hook for using token-based navigation in React components
export const useTokenNavigation = () => {
  const [navigation, setNavigation] = React.useState<TokenBasedNavigation | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const initializeNavigation = async (dataFetcher: OnchainDataFetcher, userAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const nav = new TokenBasedNavigation(dataFetcher);
      await nav.setUserAddress(userAddress);
      setNavigation(nav);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize navigation');
    } finally {
      setLoading(false);
    }
  };

  const navigateToArea = async (areaId: string) => {
    if (!navigation) return [];

    setLoading(true);
    try {
      const nodes = await navigation.navigateToArea(areaId);
      return nodes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to navigate to area');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    navigation,
    loading,
    error,
    initializeNavigation,
    navigateToArea
  };
};

// Required import for React hook
import React from 'react';