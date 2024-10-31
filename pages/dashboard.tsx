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
        <DashboardContent 
          colorState={colorState} 
          tokenAddress={router.query.token as string}
        />
      </ContentLayout>
    </MainLayout>
  );
}