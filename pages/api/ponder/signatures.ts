import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb();

    if (req.method === 'GET') {
      const { movementId } = req.query;
      
      if (!movementId) {
        return res.status(400).json({ error: 'Movement ID is required' });
      }
      
      // Get signatures for a specific movement
      const signatures = await db.all(
        'SELECT * FROM Signature s JOIN MovementSignature ms ON s.id = ms.signatureId WHERE ms.movementId = ?',
        [movementId]
      );
      
      return res.status(200).json(signatures);
    } 
    else if (req.method === 'POST') {
      const { movementId, signatureData, signer } = req.body;
      
      if (!movementId || !signatureData || !signer) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const signedAt = new Date().toISOString();
      const movementHash = signatureData.movementHash || '';
      
      // Insert signature
      await db.run(
        'INSERT INTO Signature (id, movementHash, signer, signedAt) VALUES (?, ?, ?, ?)',
        [id, movementHash, signer, signedAt]
      );
      
      // Insert movement signature relationship
      const msId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      await db.run(
        'INSERT INTO MovementSignature (id, movementId, signatureId) VALUES (?, ?, ?)',
        [msId, movementId, id]
      );
      
      return res.status(201).json({ 
        id, 
        movementHash, 
        signer, 
        signedAt,
        movementId
      });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
