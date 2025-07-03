import express, { Request, Response } from 'express';
import multer from 'multer';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/transcribe
router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const client = new SpeechClient();
  const filePath = req.file.path;
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');

  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 44100,
    languageCode: 'en-US',
  };
  const request = {
    audio,
    config,
  };

  try {
    const [response] = await client.recognize(request);
    const transcript = response.results?.map(r => r.alternatives?.[0]?.transcript).join(' ') || '';
    fs.unlinkSync(filePath); // Clean up uploaded file
    return res.json({ transcript });
  } catch (error) {
    fs.unlinkSync(filePath);
    return res.status(500).json({ error: 'Transcription failed', details: error instanceof Error ? error.message : error });
  }
});

export default router; 