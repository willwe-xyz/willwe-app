// components/TokenOperations/index.ts
import { TokenApprove } from './TokenApprove';
import { TokenBurn } from './TokenBurn';
import { TokenDistribute } from './TokenDistribute';
import { TokenMembership } from './TokenMembership';
import { TokenMint } from './TokenMint';
import { TokenSpawn } from './TokenSpawn';
import { MembraneValidationModal } from '../MembraneValidationModal';
import { useState } from 'react';
import { useTransaction } from '@/hooks/useTransaction';
import { useTokenContract } from '@/hooks/useTokenContract';

export interface TokenOperationsProps {
  nodeAddress: string;
  tokenAddress: string;
  onSuccess?: () => void;
}

export const TokenOperations: React.FC<TokenOperationsProps> = ({
  nodeAddress,
  tokenAddress,
  onSuccess
}) => {
  const [showMembraneModal, setShowMembraneModal] = useState(false);
  const [spawnParams, setSpawnParams] = useState<{amount: string; recipient: string} | null>(null);
  
  const { executeTransaction } = useTransaction();
  const tokenContract = useTokenContract(tokenAddress);

  const handleMint = async (amount: string) => {
    try {
      // Check if approval is needed first
      const needsApproval = await tokenContract.needsApproval(nodeAddress, amount);
      
      if (needsApproval) {
        await executeTransaction({
          contract: tokenContract,
          method: 'approve',
          args: [nodeAddress, amount],
          description: 'Approve token mint'
        });
      }
      
      await executeTransaction({
        contract: tokenContract,
        method: 'mint',
        args: [amount],
        description: 'Mint tokens'
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  const handleDistribute = async (recipients: string[], amounts: string[]) => {
    try {
      await executeTransaction({
        contract: tokenContract,
        method: 'distribute',
        args: [recipients, amounts],
        description: 'Distribute tokens'
      });
      onSuccess?.();
    } catch (error) {
      console.error('Distribution failed:', error);
    }
  };

  const handleMembership = async (account: string, isAdd: boolean) => {
    try {
      await executeTransaction({
        contract: tokenContract,
        method: isAdd ? 'addMember' : 'removeMember',
        args: [account],
        description: isAdd ? 'Add member' : 'Remove member'
      });
      onSuccess?.();
    } catch (error) {
      console.error('Membership operation failed:', error);
    }
  };

  const handleSpawn = async (amount: string, recipient: string) => {
    setSpawnParams({ amount, recipient });
    setShowMembraneModal(true);
  };

  const handleMembraneValidation = async (validationData: any) => {
    if (!spawnParams) return;
    
    try {
      await executeTransaction({
        contract: tokenContract,
        method: 'spawn',
        args: [spawnParams.amount, spawnParams.recipient, validationData],
        description: 'Spawn tokens'
      });
      setShowMembraneModal(false);
      setSpawnParams(null);
      onSuccess?.();
    } catch (error) {
      console.error('Spawn failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <TokenMint onMint={handleMint} />
      <TokenBurn tokenAddress={tokenAddress} onSuccess={onSuccess} />
      <TokenDistribute onDistribute={handleDistribute} />
      <TokenMembership onUpdateMembership={handleMembership} />
      <TokenSpawn onSpawn={handleSpawn} />
      
      <MembraneValidationModal
        isOpen={showMembraneModal}
        onClose={() => setShowMembraneModal(false)}
        onValidate={handleMembraneValidation}
        nodeAddress={nodeAddress}
      />
    </div>
  );
};

export {
  TokenApprove,
  TokenBurn,
  TokenDistribute,
  TokenMembership,
  TokenMint,
  TokenSpawn
};