

// Page Components



// Modified pages

// pages/dashboard.tsx
export default function DashboardPage() {
  const router = useRouter();
  const { tokenAddress } = router.query;

  return (
    <MainLayout>
      <DashboardContent tokenAddress={tokenAddress as string} />
    </MainLayout>
  );
}

// pages/nodes/[chainId]/[nodeId].tsx
export default function NodePage() {
  const router = useRouter();
  const { nodeId } = router.query;

  return (
    <MainLayout>
      <DashboardContent nodeId={nodeId as string} />
    </MainLayout>
  );
}