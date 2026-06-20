import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Board from './models/Board.js';

dotenv.config();

const app = express();

// Set limits to 50mb to handle high-resolution base64 images of Polaroids
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

let isDbConnected = false;
// Fallback in-memory storage if MongoDB is not connected
const memoryBoards = {};

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB.');
      isDbConnected = true;
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB, falling back to in-memory DB:', err.message);
    });
} else {
  console.log('No MONGODB_URI environment variable set. Running with In-Memory fallback store.');
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: isDbConnected ? 'MongoDB connected' : 'In-Memory Mock Storage',
    timestamp: new Date()
  });
});

// Save Board
app.post('/api/boards', async (req, res) => {
  try {
    const { title, background, polaroids, stickers } = req.body;

    if (isDbConnected) {
      const newBoard = new Board({ title, background, polaroids, stickers });
      await newBoard.save();
      return res.status(201).json({ id: newBoard._id, success: true });
    } else {
      // Mock save to local memory
      const mockId = Math.random().toString(36).substring(2, 11);
      memoryBoards[mockId] = {
        _id: mockId,
        title,
        background,
        polaroids: polaroids || [],
        stickers: stickers || [],
        createdAt: new Date()
      };
      return res.status(201).json({ id: mockId, success: true, warning: 'Saved to temporary server memory' });
    }
  } catch (error) {
    console.error('Save Board Error:', error);
    res.status(500).json({ error: 'Failed to save board', message: error.message });
  }
});

// Load Board
app.get('/api/boards/:id', async (req, res) => {
  try {
    const boardId = req.params.id;

    if (isDbConnected) {
      if (!mongoose.Types.ObjectId.isValid(boardId)) {
        return res.status(400).json({ error: 'Invalid board ID format' });
      }
      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ error: 'Board not found' });
      }
      return res.json(board);
    } else {
      const board = memoryBoards[boardId];
      if (!board) {
        return res.status(404).json({ error: 'Board not found in temporary memory' });
      }
      return res.json(board);
    }
  } catch (error) {
    console.error('Load Board Error:', error);
    res.status(500).json({ error: 'Failed to retrieve board', message: error.message });
  }
});

// For Vercel Serverless compatibility
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running local development on port ${PORT}`);
  });
}

export default app;
