import {MembraneMetadata} from '../types/chainData';

const IPFS_GATEWAY = 'https://underlying-tomato-locust.myfilebase.com/ipfs/';

export const fetchIPFSMetadata = async (cid: string): Promise<MembraneMetadata> => {
  try {
    // Using IPFS gateway to fetch metadata
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch IPFS metadata');
    }
    const data = await response.json();
    return {
      name: data.title || 'Untitled',
      id: data.id || cid,
      description: data.description,
      characteristics: data.characteristics || [],
      membershipConditions: data.membershipConditions || [],
      createdAt: data.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error);
    return {
      name: 'Untitled',
      id: cid,
      description: 'No description available',
      characteristics: [],
      membershipConditions: [],
      createdAt: new Date().toISOString()
    };
  }
};

export const getMembraneNameFromCID = async (cid: string): Promise<string> => {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    if (response.ok) {
      console.log(`Fetched membrane metadata for CID ${cid}:`, response);
      const metadata = await response.json();
      console.log('Metadata name:', metadata.name);
      return metadata.name;
    }
  } catch (err) {
    console.error(`Error fetching membrane metadata for CID ${cid}:`, err);
  }
  return '';
};

interface BatchFetchResult<T> {
  cid: string;
  data: T;
  success: boolean;
  error?: string;
}

export const batchFetchIPFS = async <T>(
  cids: string[],
  fetchFn: (cid: string) => Promise<T>
): Promise<BatchFetchResult<T>[]> => {
  const uniqueCids = Array.from(new Set(cids));

  const fetchPromises = uniqueCids.map(async (cid): Promise<BatchFetchResult<T>> => {
    try {
      const data = await fetchFn(cid);
      return {
        cid,
        data,
        success: true
      };
    } catch (error) {
      return {
        cid,
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  return Promise.all(fetchPromises);
};

export const batchGetMembraneData = (cids: string[]): Promise<BatchFetchResult<MembraneMetadata>[]> => {
  return batchFetchIPFS(cids, fetchIPFSMetadata);
};

export const batchGetMembraneNames = (cids: string[]): Promise<BatchFetchResult<string>[]> => {
  return batchFetchIPFS(cids, getMembraneNameFromCID);
};
