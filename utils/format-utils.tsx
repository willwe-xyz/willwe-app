// import { BalanceItem } from '@covalenthq/client-sdk';

// // Format balance display
// export function formatBalance(balance: string | bigint): string {
//   try {
//     const balanceBigInt = typeof balance === 'string' ? BigInt(balance) : balance;
//     // Convert to string and handle decimals (assuming 18 decimals)
//     const stringBalance = balanceBigInt.toString();
//     const decimalPosition = Math.max(0, stringBalance.length - 18);
    
//     if (decimalPosition === 0) {
//       return `0.${stringBalance.padStart(18, '0')}`;
//     }
    
//     const wholePart = stringBalance.slice(0, decimalPosition);
//     const decimalPart = stringBalance.slice(decimalPosition).padEnd(18, '0');
    
//     return `${wholePart}.${decimalPart}`;
//   } catch (error) {
//     console.error('Error formatting balance:', error);
//     return '0.00';
//   }
// }

// // Format token amount for display
// export function formatTokenAmount(amount: string): { 
//   digits: string; 
//   decimals: string 
// } {
//   try {
//     const parts = amount.split('.');
//     return {
//       digits: parts[0] || '0',
//       decimals: parts[1] || '0'
//     };
//   } catch (error) {
//     console.error('Error formatting token amount:', error);
//     return {
//       digits: '0',
//       decimals: '0'
//     };
//   }
// }

// // Calculate percentage
// export function calculatePercentage(
//   amount: string, 
//   total: string
// ): number {
//   try {
//     const amountBN = BigInt(amount);
//     const totalBN = BigInt(total);
//     if (totalBN === BigInt(0)) return 0;
//     return Number((amountBN * BigInt(100)) / totalBN);
//   } catch (error) {
//     console.error('Error calculating percentage:', error);
//     return 0;
//   }
// }