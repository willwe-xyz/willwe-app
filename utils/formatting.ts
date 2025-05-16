export const formatAddress = (address: string | undefined | null): string => {
  if (!address || typeof address !== 'string') return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};