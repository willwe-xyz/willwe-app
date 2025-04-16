import { ethers } from 'ethers';
import { ERC20_ABI } from '../constants/ABIs';
import { getRPCUrl } from './getRPCUrl';

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
  chainId: string = '11155111' // Default to Sepolia
): Promise<{
  balance: string;
  symbol: string;
  decimals: number;
}> {
  try {
    const provider = new ethers.JsonRpcProvider(getRPCUrl(chainId));
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [balance, symbol, decimals] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    return {
      balance: ethers.formatUnits(balance, decimals),
      symbol,
      decimals,
    };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
} 