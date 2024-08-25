export const getCovalentApiKey = (): string => {
    const apiKey = process.env.NEXT_PUBLIC_COVALENT_API_KEY;
    if (!apiKey) {
      throw new Error('Covalent API key not configured');
    }
    return apiKey;
  };
  
  export const getAirstackApiKey = (): string => {
    const apiKey = process.env.NEXT_PUBLIC_AIRSTACK_API_KEY;
    if (!apiKey) {
      throw new Error('Airstack API key not configured');
    }
    return apiKey;
  };
  
  export const getCoinbOnchainKitApiKey = (): string => {
    const apiKey = process.env.COINB_ONCHAINKIT_API_KEY;
    if (!apiKey) {
      throw new Error('Coinb Onchainkit API key not configured');
    }
    return apiKey;
  };