import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb();

    if (req.method === 'GET') {
      const { userAddress } = req.query;
      
      if (!userAddress) {
        return res.status(400).json({ error: 'User address is required' });
      }
      
      // Get user preferences
      const preferences = await db.get(
        'SELECT * FROM UserPreference WHERE userId = ?',
        [userAddress]
      );
      
      if (!preferences) {
        return res.status(404).json({ error: 'User preferences not found' });
      }
      
      return res.status(200).json(preferences);
    } 
    else if (req.method === 'POST') {
      const { userAddress, redistributivePreferences, supportedMovements } = req.body;
      
      if (!userAddress) {
        return res.status(400).json({ error: 'User address is required' });
      }
      
      const timestamp = new Date().toISOString();
      
      // Check if user preferences exist
      const existingPrefs = await db.get(
        'SELECT * FROM UserPreference WHERE userId = ?',
        [userAddress]
      );
      
      if (existingPrefs) {
        // Update existing preferences
        await db.run(
          'UPDATE UserPreference SET key = ?, value = ? WHERE userId = ?',
          [
            'redistributivePreferences',
            JSON.stringify(redistributivePreferences),
            userAddress
          ]
        );
      } else {
        // Create new preferences
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await db.run(
          'INSERT INTO UserPreference (id, userId, key, value) VALUES (?, ?, ?, ?)',
          [
            id,
            userAddress,
            'redistributivePreferences',
            JSON.stringify(redistributivePreferences)
          ]
        );
        
        if (supportedMovements && supportedMovements.length > 0) {
          const supportedMovementsId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          await db.run(
            'INSERT INTO UserPreference (id, userId, key, value) VALUES (?, ?, ?, ?)',
            [
              supportedMovementsId,
              userAddress,
              'supportedMovements',
              JSON.stringify(supportedMovements)
            ]
          );
        }
      }
      
      return res.status(200).json({
        userAddress,
        redistributivePreferences,
        supportedMovements,
        updatedAt: timestamp
      });
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
