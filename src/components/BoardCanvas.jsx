import React, { useRef, useState } from 'react';
import PolaroidCard from './PolaroidCard';
import StickerItem from './StickerItem';
import { useSound } from '../hooks/useSound';
import { ImagePlus, Sparkles, Upload } from 'lucide-react';

export default function BoardCanvas({
  polaroids,
  stickers,
  background,
  onUpdatePolaroid,
  onDeletePolaroid,
  onAddPolaroid,
  onUpdateSticker,
  onDeleteSticker,
  selectedId,
  onSelectId,
  canvasRef
}) {
  const { playShutter, playSlide } = useSound();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Drag Over to show drop zone
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Process dropped files
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Get drop position relative to canvas
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left - 128; // Center the 256px wide card
      const dropY = e.clientY - canvasRect.top - 140; // Center the 280px tall card

      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            // Stagger multiple dropped files slightly
            const finalX = Math.max(20, Math.min(canvasRect.width - 280, dropX + (index * 25)));
            const finalY = Math.max(20, Math.min(canvasRect.height - 300, dropY + (index * 25)));
            
            onAddPolaroid({
              imageUrl: event.target.result,
              x: finalX,
              y: finalY,
              caption: file.name.substring(0, file.name.lastIndexOf('.')) || 'Snapshot',
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Handle manual file selection via hidden input
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            // Place in center with slight offset for multiple files
            const centerX = (canvasRect.width / 2) - 128 + (index * 20);
            const centerY = (canvasRect.height / 2) - 150 + (index * 20);

            onAddPolaroid({
              imageUrl: event.target.result,
              x: Math.max(20, Math.min(canvasRect.width - 280, centerX)),
              y: Math.max(20, Math.min(canvasRect.height - 300, centerY)),
              caption: file.name.substring(0, file.name.lastIndexOf('.')) || 'Snapshot',
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleCanvasClick = (e) => {
    // If clicked directly on the canvas background, deselect current elements
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-background-target')) {
      onSelectId(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
      className={`relative w-full h-[calc(100vh-130px)] rounded-2xl shadow-inner border border-zinc-800/40 overflow-hidden transition-all duration-500 canvas-background-target ${background} ${
        isDragOver ? 'ring-4 ring-indigo-500/50 bg-opacity-90 scale-[0.995]' : ''
      }`}
    >
      {/* Texture grain overlay */}
      <div className="absolute inset-0 pointer-events-none grain-overlay canvas-background-target" />

      {/* Grid pattern background for vintage grids */}
      {background.includes('bg-retro-grid') && (
        <div className="absolute inset-0 pointer-events-none bg-retro-grid-dark canvas-background-target" />
      )}

      {/* Empty State */}
      {polaroids.length === 0 && stickers.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none canvas-background-target">
          <div className="glass-dark border border-zinc-700/30 p-8 rounded-2xl max-w-sm text-center animate-subtle-float flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Upload size={28} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-zinc-200">Your PolaPin Canvas is Empty</h3>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                Drag & drop photos directly onto this board, or click "Add Polaroid" below to start pinning.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="pointer-events-auto mt-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ImagePlus size={14} /> Upload Photos
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input for uploading */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Render Draggable Stickers */}
      {stickers.map((sticker) => (
        <StickerItem
          key={sticker.id}
          sticker={sticker}
          onUpdate={onUpdateSticker}
          onDelete={onDeleteSticker}
          onSelect={() => onSelectId(sticker.id)}
          isSelected={selectedId === sticker.id}
          canvasRef={canvasRef}
        />
      ))}

      {/* Render Draggable Polaroids */}
      {polaroids.map((card) => (
        <PolaroidCard
          key={card.id}
          card={card}
          onUpdate={onUpdatePolaroid}
          onDelete={onDeletePolaroid}
          onSelect={() => onSelectId(card.id)}
          isSelected={selectedId === card.id}
          canvasRef={canvasRef}
        />
      ))}

      {/* Dragover Drop Overlay indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm pointer-events-none flex flex-col items-center justify-center z-50 border-4 border-dashed border-indigo-400 m-2 rounded-xl">
          <Upload size={54} className="text-indigo-300 animate-bounce mb-3" />
          <h2 className="text-xl font-semibold text-white">Drop to Developing Film</h2>
          <p className="text-zinc-300 text-sm mt-1">Release to load polaroid cards</p>
        </div>
      )}
    </div>
  );
}
