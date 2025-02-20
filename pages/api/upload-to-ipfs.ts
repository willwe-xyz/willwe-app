import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectManager } from "@filebase/sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const objectManager = new ObjectManager(
      process.env.FILEBASE_S3_KEY!,
      process.env.FILEBASE_S3_SECRET!,
      {
        bucket: `${process.env.FILEBASE_BUCKET_NAME}`
      }
    );

    const objectName = `entity-${Date.now()}.json`;
    const uploadedObject = await objectManager.upload(
      objectName,
      Buffer.from(JSON.stringify(data)),
      'application/json',
      process.env.FILEBASE_BUCKET_NAME
    );

    res.status(200).json({ cid: uploadedObject.cid });
  } catch (error) {
    console.error('Error uploading to Filebase:', error);
    res.status(500).json({ message: 'Error uploading to IPFS' });
  }
}