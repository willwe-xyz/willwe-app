import React, { useState, useEffect } from 'react';
import { NavigationArea, UserNavigationData, TokenBasedNavigation } from '../utils/tokenNavigation';
import { createOnchainDataFetcher } from '../utils/onchainData';
import { NodeData } from '../types/nodeData';

interface NavigationProps {
  userAddress: string | null;
  onAreaSelected: (nodes: NodeData[]) => void;
  onUserAddressChange: (address: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  userAddress, 
  onAreaSelected, 
  onUserAddressChange 
}) => {
  const [navigation, setNavigation] = useState<TokenBasedNavigation | null>(null);
  const [navigationData, setNavigationData] = useState<UserNavigationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputAddress, setInputAddress] = useState('');

  useEffect(() => {
    if (userAddress) {
      initializeNavigation(userAddress);
    }
  }, [userAddress]);

  const initializeNavigation = async (address: string) => {
    setLoading(true);
    setError(null);

    try {
      const dataFetcher = createOnchainDataFetcher();
      const nav = new TokenBasedNavigation(dataFetcher);
      await nav.setUserAddress(address);
      const navData = await nav.refreshUserNavigation();
      
      setNavigation(nav);
      setNavigationData(navData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize navigation');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = async (area: NavigationArea) => {
    if (!navigation) return;

    setLoading(true);
    try {
      const nodes = await navigation.navigateToArea(area.id);
      onAreaSelected(nodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to navigate to area');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAddress.trim()) {
      onUserAddressChange(inputAddress.trim());
      setInputAddress('');
    }
  };

  const renderAreaList = (areas: NavigationArea[], title: string, color: string) => {
    if (areas.length === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color, margin: '0 0 10px 0', fontSize: '14px' }}>{title}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => handleAreaClick(area)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${color}`,
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${color}20`;
                e.currentTarget.style.borderColor = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = color;
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{area.name}</div>
              <div style={{ fontSize: '10px', color: '#aaa' }}>
                Balance: {area.userTokenBalance.toLocaleString()} • {area.nodeIds.length} nodes
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '300px',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#00ff88', fontSize: '16px' }}>
        Galaxy Navigation
      </h3>

      {/* Address Input */}
      <form onSubmit={handleAddressSubmit} style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Enter wallet address (0x...)"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            marginBottom: '8px'
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#00ff88',
            border: 'none',
            borderRadius: '6px',
            color: 'black',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          Load Navigation
        </button>
      </form>

      {/* Current User */}
      {userAddress && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '8px 12px', 
          background: 'rgba(0, 255, 136, 0.1)',
          border: '1px solid #00ff88',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '10px', color: '#00ff88', marginBottom: '4px' }}>
            Current User
          </div>
          <div style={{ fontSize: '11px', wordBreak: 'break-all' }}>
            {userAddress}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#00ff88' 
        }}>
          Loading navigation data...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ 
          background: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid #ff4444',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
          color: '#ff4444',
          fontSize: '11px'
        }}>
          {error}
        </div>
      )}

      {/* Navigation Areas */}
      {navigationData && !loading && (
        <div>
          {renderAreaList(navigationData.ownedNodes, 'Owned Galaxies', '#00ff88')}
          {renderAreaList(navigationData.memberNodes, 'Member Areas', '#4488ff')}
          {renderAreaList(navigationData.accessibleNodes, 'Accessible Areas', '#ffaa00')}
          
          {navigationData.ownedNodes.length === 0 && 
           navigationData.memberNodes.length === 0 && 
           navigationData.accessibleNodes.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: '#888',
              fontSize: '11px'
            }}>
              No accessible areas found for this address.
              <br />
              <br />
              You need tokens in WillWe nodes to access areas.
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!userAddress && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#888',
          fontSize: '11px'
        }}>
          Enter your wallet address to view your galaxies and areas.
        </div>
      )}
    </div>
  );
};