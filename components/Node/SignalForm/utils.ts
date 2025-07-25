import { ethers } from 'ethers';

export const calculateMonthlyPreference = (
  amount: string,
  decimals: number = 18
): string => {
  try {
    const annualAmount = ethers.parseUnits(amount, decimals);
    const monthlyAmount = annualAmount / BigInt(12);
    return ethers.formatUnits(monthlyAmount, decimals);
  } catch (error) {
    console.error('Error calculating monthly preference:', error);
    return '0';
  }
};

export const validateSignals = (signals: number[]): boolean => {
  if (signals.length === 0) return false;
  const sum = signals.reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 100) < 0.001; // Allow for small floating point errors
};

export const formatUnits = (value: string, decimals: number = 2): string => {
  const num = parseFloat(value);
  return num.toFixed(decimals);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};