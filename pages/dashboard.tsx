import { useRouter } from 'next/router';
import { usePrivy } from "@privy-io/react-auth";
import { MainLayout } from '../components/Layout/MainLayout';
import ContentLayout from '../components/Layout/ContentLayout';
import DashboardContent from '../components/Layout/DashboardContent';
import { useNode } from '../contexts/NodeContext';
import { useColorManagement } from '../hooks/useColorManagement';

export default function DashboardPage() {
  const router = useRouter();
  const { colorState, cycleColors } = useColorManagement();
  const { user, ready, authenticated, logout, login } = usePrivy();
  const { selectedToken, selectToken } = useNode();

  // Handle token selection from sidebar
  const handleTokenSelect = (tokenAddress: string) => {
    selectToken(tokenAddress);
    // Update URL to reflect selected token
    router.push({
      pathname: '/dashboard',
      query: { token: tokenAddress }
    }, undefined, { shallow: true });
  };

  // Handle compose panel submission
  const handleComposeSubmit = async (data: any) => {
    // Handle token creation or entity definition
    // This will be handled by the ComposePanel component in MainLayout
  };

  // Prepare header props
  const headerProps = {
    userAddress: user?.wallet?.address,
    chainId: user?.wallet?.chainId || '',
    logout,
    login,
    selectedNodeId: undefined,
    isTransacting: false,
    contrastingColor: colorState.contrastingColor,
    reverseColor: colorState.reverseColor,
    cycleColors,
    onComposeSubmit: handleComposeSubmit
  };

  // Prepare sidebar props
  const sidebarProps = {
    selectedToken,
    handleTokenSelect,
    ...colorState,
    userAddress: user?.wallet?.address || '',
    chainId: user?.wallet?.chainId || '',
  };

  return (
    <MainLayout headerProps={headerProps}>
      <ContentLayout sidebarProps={sidebarProps}>
        {!router.query.token && !selectedToken ? (
          <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto w-full p-8">
            <div className="w-full bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 text-center">Select a Context</h2>
              <p className="text-gray-600 text-center mb-8">Choose a value base to explore its context</p>
              
              {/* Activity Feed Placeholder */}
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 text-center">(Activity feed is disabled)</div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <DashboardContent 
            colorState={colorState} 
            tokenAddress={router.query.token as string}
          />
        )}
      </ContentLayout>
    </MainLayout>
  );
}