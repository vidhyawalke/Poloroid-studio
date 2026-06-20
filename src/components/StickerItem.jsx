import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCw } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export default function StickerItem({
  sticker,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  canvasRef
}) {
  const { playTape } = useSound();
  const [isHovered, setIsHovered] = useState(false);

  // Rotate sticker by 30 degree increments
  const handleRotate = (e) => {
    e.stopPropagation();
    playTape();
    const currentRot = sticker.rotation || 0;
    let nextRot = currentRot + 30;
    if (nextRot >= 360) nextRot = 0;
    onUpdate(sticker.id, { rotation: nextRot });
  };

  const getStickerContent = () => {
    switch (sticker.type) {
      // Washi Tapes
      case 'tape-pink':
        return (
          <div className="w-28 h-7 bg-rose-400/50 backdrop-blur-[1px] border border-rose-300/30 washi-tape shadow-sm flex items-center justify-center font-mono text-[9px] text-rose-800/60 tracking-wider">
            🌸 • 🌸 • 🌸
          </div>
        );
      case 'tape-green':
        return (
          <div className="w-28 h-7 bg-emerald-400/50 backdrop-blur-[1px] border border-emerald-300/30 washi-tape shadow-sm flex items-center justify-center font-mono text-[9px] text-emerald-800/60 tracking-wider">
            🍃 • 🍃 • 🍃
          </div>
        );
      case 'tape-blue':
        return (
          <div className="w-28 h-7 bg-cyan-400/50 backdrop-blur-[1px] border border-cyan-300/30 washi-tape shadow-sm flex items-center justify-center font-mono text-[9px] text-cyan-800/60 tracking-wider">
            🌊 • 🌊 • 🌊
          </div>
        );
      case 'tape-yellow':
        return (
          <div className="w-28 h-7 bg-amber-400/50 backdrop-blur-[1px] border border-amber-300/30 washi-tape shadow-sm flex items-center justify-center font-mono text-[9px] text-amber-800/60 tracking-wider">
            🍋 • 🍋 • 🍋
          </div>
        );

      // Pushpins
      case 'pin-red':
        return (
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Pin head */}
            <div className="w-4 h-4 rounded-full bg-rose-600 shadow-md border-b-2 border-rose-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
            {/* Pin body/shadow */}
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-stone-400/80 rounded-full" />
            <div className="absolute top-[22px] left-[52%] w-1.5 h-1.5 bg-stone-950/30 rounded-full blur-[1px]" />
          </div>
        );
      case 'pin-blue':
        return (
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-indigo-600 shadow-md border-b-2 border-indigo-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-stone-400/80 rounded-full" />
            <div className="absolute top-[22px] left-[52%] w-1.5 h-1.5 bg-stone-950/30 rounded-full blur-[1px]" />
          </div>
        );
      case 'pin-gold':
        return (
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-md border-b-2 border-amber-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>
            <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-stone-400/80 rounded-full" />
            <div className="absolute top-[22px] left-[52%] w-1.5 h-1.5 bg-stone-950/30 rounded-full blur-[1px]" />
          </div>
        );

      // Cute Emojis / Doodles
      case 'doodle-heart':
        return <div className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] select-none">❤️</div>;
      case 'doodle-star':
        return <div className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] select-none">⭐️</div>;
      case 'doodle-sparkle':
        return <div className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] select-none">✨</div>;
      case 'doodle-flower':
        return <div className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] select-none">🌸</div>;
      case 'doodle-coffee':
        return <div className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] select-none">☕️</div>;
      case 'doodle-pin':
        return <div className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] select-none">📍</div>;

      default:
        return null;
    }
  };

  const isTape = sticker.type.startsWith('tape-');

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={canvasRef}
      onDragStart={() => {
        onSelect();
        playTape();
      }}
      onDragEnd={(e, info) => {
        const rect = e.target.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        onUpdate(sticker.id, {
          x: rect.left - canvasRect.left + (isTape ? 10 : 0),
          y: rect.top - canvasRect.top + (isTape ? 4 : 0)
        });
      }}
      onTapStart={onSelect}
      style={{
        position: 'absolute',
        left: sticker.x,
        top: sticker.y,
        rotate: `${sticker.rotation || 0}deg`,
        zIndex: isSelected ? 60 : 25,
        touchAction: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative cursor-grab active:cursor-grabbing p-1 ${
        isSelected ? 'ring-1 ring-indigo-400/40 rounded' : ''
      }`}
    >
      {/* Action Buttons (visible on hover) */}
      {isHovered && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/90 py-0.5 px-1.5 rounded-full shadow-md border border-zinc-700/80 z-50">
          <button
            onClick={handleRotate}
            title="Rotate sticker"
            className="p-1 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <RotateCw size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sticker.id);
            }}
            title="Remove sticker"
            className="p-1 rounded-full text-rose-400 hover:text-rose-500 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* Render Sticker Content */}
      <div className="relative select-none pointer-events-none">
        {getStickerContent()}
      </div>
    </motion.div>
  );
}
