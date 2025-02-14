// This file implements the logic for fetching data from IPFS.
// It defines an API endpoint that handles incoming requests and retrieves data based on the provided hash.

import { NextApiRequest, NextApiResponse } from 'next';

const getIpfsData = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash } = req.query;

  if (!hash || typeof hash !== 'string') {
    return res.status(400).json({ error: 'Invalid hash parameter' });
  }

  const requestUrl = `${process.env.IPFS_GATEWAY}${hash}`;
  console.log('Fetching data from IPFS:', requestUrl);
  try {
    // Implement your logic to fetch data from IPFS using the hash
    const response = await fetch(`${process.env.IPFS_GATEWAY}${hash}`);
    console.log("getIpfsData, response:", response);
    if (!response.ok) {
      throw new Error('Failed to fetch data from IPFS');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from IPFS:', error);
    return res.status(500).json({ error: 'Failed to fetch data from IPFS' });
  }
};

export default getIpfsData;