import { BigNumber } from 'ethers';

export const formatBalance = (balance: string | undefined): string => {
  if (!balance) return '0';
  
  try {
    const bigNumber = BigNumber.from(balance);
    const formatted = bigNumber.toString();
    
    // If the number is too large, use scientific notation
    if (formatted.length > 6) {
      const num = Number(formatted);
      return num.toExponential(2);
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
};

export const formatTokenAmount = (
  amount: string | undefined,
  decimals: number = 18
): string => {
  if (!amount) return '0';
  
  try {
    const bigNumber = BigNumber.from(amount);
    const divisor = BigNumber.from(10).pow(decimals);
    const beforeDecimal = bigNumber.div(divisor);
    const afterDecimal = bigNumber.mod(divisor);
    
    let formatted = beforeDecimal.toString();
    
    if (!afterDecimal.isZero()) {
      const afterDecimalStr = afterDecimal.toString().padStart(decimals, '0');
      formatted += '.' + afterDecimalStr.slice(0, 4); // Show up to 4 decimal places
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};