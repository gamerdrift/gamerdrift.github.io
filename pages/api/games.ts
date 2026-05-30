import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const jsonPath = path.resolve(process.cwd(), 'public_data', 'games.json');
    const data = await fs.readFile(jsonPath, 'utf-8');
    const games = JSON.parse(data);
    res.status(200).json(games);
  } catch (error) {
    console.error('Error reading games data:', error);
    res.status(500).json({ error: 'Failed to load games data' });
  }
}
