interface IPFSMetadata {
    title: string;
    description?: string;
    // Add other metadata fields as needed
  }
  
  export const fetchIPFSMetadata = async (cid: string): Promise<IPFSMetadata> => {
    try {
      // Using IPFS gateway to fetch metadata
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch IPFS metadata');
      }
      const data = await response.json();
      return {
        title: data.title || 'Untitled',
        description: data.description
      };
    } catch (error) {
      console.error('Error fetching IPFS metadata:', error);
      return {
        title: 'Untitled',
        description: 'No description available'
      };
    }
  };