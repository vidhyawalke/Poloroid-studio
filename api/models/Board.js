import mongoose from 'mongoose';

const PolaroidSchema = new mongoose.Schema({
  id: { type: String, required: true },
  imageUrl: { type: String, required: true }, // Base64 data or image URL
  caption: { type: String, default: '' },
  date: { type: String, default: '' },
  font: { type: String, default: 'font-reenie' },
  filter: { type: String, default: 'normal' },
  rotation: { type: Number, default: 0 },
  x: { type: Number, default: 100 },
  y: { type: Number, default: 100 },
  scale: { type: Number, default: 1 },
});

const StickerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // e.g. 'tape-pink', 'pin-green', 'heart'
  x: { type: Number, default: 100 },
  y: { type: Number, default: 100 },
  rotation: { type: Number, default: 0 },
});

const BoardSchema = new mongoose.Schema({
  title: { type: String, default: 'My PolaPin Board' },
  background: { type: String, default: 'bg-gradient-to-br from-indigo-50 to-rose-50' },
  polaroids: [PolaroidSchema],
  stickers: [StickerSchema],
  createdAt: { type: Date, default: Date.now },
});

// Use export default for ESM module
export default mongoose.models.Board || mongoose.model('Board', BoardSchema);
