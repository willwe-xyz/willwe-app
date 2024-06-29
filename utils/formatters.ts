export const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  export const calculateDailyGrowth = (inflation: string): string => {
    const inflationRate = parseFloat(inflation);
    const dailyGrowth = inflationRate * 86400; // seconds in a day
    return formatBalance(dailyGrowth.toString());
  };