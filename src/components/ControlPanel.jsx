import React, { useRef, useState } from 'react';
import { 
  ImagePlus, 
  Smile, 
  Palette, 
  Download, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Share2, 
  Volume,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useSound } from '../hooks/useSound';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

const BACKGROUNDS = [
  { name: 'Warm Cork', value: 'bg-cork' },
  { name: 'Dark Grid', value: 'bg-retro-grid-dark' },
  { name: 'Pastel Dream', value: 'bg-gradient-to-br from-indigo-900/60 via-purple-900/50 to-pink-900/60' },
  { name: 'Sage Garden', value: 'bg-gradient-to-br from-zinc-900 via-stone-850 to-emerald-950/60' },
  { name: 'Sunset Glow', value: 'bg-gradient-to-br from-rose-950/70 via-amber-950/50 to-orange-950/60' },
  { name: 'Retro Grid', value: 'bg-retro-grid' }
];

const STICKERS = [
  { name: 'Tape Pink', type: 'tape-pink', category: 'tapes' },
  { name: 'Tape Green', type: 'tape-green', category: 'tapes' },
  { name: 'Tape Blue', type: 'tape-blue', category: 'tapes' },
  { name: 'Tape Yellow', type: 'tape-yellow', category: 'tapes' },
  { name: 'Red Pin', type: 'pin-red', category: 'pins' },
  { name: 'Blue Pin', type: 'pin-blue', category: 'pins' },
  { name: 'Gold Pin', type: 'pin-gold', category: 'pins' },
  { name: 'Heart', type: 'doodle-heart', category: 'doodles' },
  { name: 'Star', type: 'doodle-star', category: 'doodles' },
  { name: 'Sparkle', type: 'doodle-sparkle', category: 'doodles' },
  { name: 'Flower', type: 'doodle-flower', category: 'doodles' },
  { name: 'Coffee', type: 'doodle-coffee', category: 'doodles' },
  { name: 'Pushpin', type: 'doodle-pin', category: 'doodles' },
];

export default function ControlPanel({
  background,
  onChangeBackground,
  onAddSticker,
  onAddPolaroid,
  onResetBoard,
  onSaveBoard,
  isSaving,
  canvasRef
}) {
  const { isMuted, toggleMute, playShutter, playTape, playSlide } = useSound();
  const [activeDrawer, setActiveDrawer] = useState(null); // 'background', 'stickers', null
  const fileInputRef = useRef(null);

  // Trigger file picker for Polaroid
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            // Spawn with dynamic scatter offset
            const offset = index * 20;
            onAddPolaroid({
              imageUrl: event.target.result,
              x: 100 + offset,
              y: 80 + offset,
              caption: file.name.substring(0, file.name.lastIndexOf('.')) || 'Snapshot',
            });
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Trigger sticker creation
  const handleStickerClick = (type) => {
    playTape();
    onAddSticker({
      type,
      x: 180 + Math.random() * 60,
      y: 120 + Math.random() * 60,
      rotation: Math.floor(Math.random() * 40) - 20,
    });
  };

  // Export board to PNG
  const handleExport = async () => {
    if (!canvasRef.current) return;
    playShutter();

    // Select files and hide any interactive hover states/toolbars before snapshot
    const activeToolbars = document.querySelectorAll('.group');
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Double quality
        ignoreElements: (element) => {
          // Ignore action buttons or editor toolbars during capture
          return element.classList.contains('absolute') && element.classList.contains('top-2') && element.classList.contains('right-2');
        }
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'polapin-board.png';
      link.href = image;
      link.click();
      
      // Fun celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Export Error:', error);
    }
  };

  const toggleDrawer = (drawerName) => {
    playSlide();
    if (activeDrawer === drawerName) {
      setActiveDrawer(null);
    } else {
      setActiveDrawer(drawerName);
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full z-40 px-4">
      {/* Floating Drawers */}
      
      {/* 1. STICKERS DRAWER */}
      {activeDrawer === 'stickers' && (
        <div className="absolute -top-36 w-full max-w-xl glass-dark rounded-xl p-3.5 shadow-2xl border border-zinc-700/40 animate-slideUp flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">Stickers & Washi Tapes</span>
            <button onClick={() => toggleDrawer('stickers')} className="text-zinc-500 hover:text-zinc-300">
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto pr-1">
            {STICKERS.map((st) => (
              <button
                key={st.name}
                onClick={() => handleStickerClick(st.type)}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/30 hover:border-zinc-600 transition-all group/btn"
              >
                {st.type.startsWith('tape-') ? (
                  <div className={`w-10 h-3 rounded-sm ${
                    st.type === 'tape-pink' ? 'bg-rose-400/60' :
                    st.type === 'tape-green' ? 'bg-emerald-400/60' :
                    st.type === 'tape-blue' ? 'bg-cyan-400/60' : 'bg-amber-400/60'
                  }`} />
                ) : st.type.startsWith('pin-') ? (
                  <div className={`w-3.5 h-3.5 rounded-full ${
                    st.type === 'pin-red' ? 'bg-rose-600' :
                    st.type === 'pin-blue' ? 'bg-indigo-600' : 'bg-amber-500'
                  }`} />
                ) : (
                  <span className="text-lg">{
                    st.type === 'doodle-heart' ? '❤️' :
                    st.type === 'doodle-star' ? '⭐️' :
                    st.type === 'doodle-sparkle' ? '✨' :
                    st.type === 'doodle-flower' ? '🌸' :
                    st.type === 'doodle-coffee' ? '☕️' : '📍'
                  }</span>
                )}
                <span className="text-[9px] text-zinc-400 mt-1 font-medium group-hover/btn:text-zinc-200 transition-colors">
                  {st.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. BACKGROUND SELECTOR DRAWER */}
      {activeDrawer === 'background' && (
        <div className="absolute -top-24 w-full max-w-lg glass-dark rounded-xl p-3 shadow-2xl border border-zinc-700/40 animate-slideUp flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">Board Backgrounds</span>
            <button onClick={() => toggleDrawer('background')} className="text-zinc-500 hover:text-zinc-300">
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.name}
                onClick={() => {
                  playSlide();
                  onChangeBackground(bg.value);
                }}
                className={`flex-shrink-0 flex flex-col items-center gap-1 p-1 rounded-lg border ${
                  background === bg.value
                    ? 'border-indigo-500 bg-zinc-800'
                    : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/80'
                }`}
              >
                <div className={`w-16 h-8 rounded-md border border-zinc-700/50 ${bg.value}`} />
                <span className="text-[9px] text-zinc-300 font-medium">{bg.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Floating Dashboard Bar */}
      <div className="glass-dark border border-zinc-800/60 py-3 px-6 rounded-full shadow-2xl flex items-center justify-between w-full max-w-2xl gap-4 my-4">
        {/* Left Actions: Upload & Stickers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUploadClick}
            title="Upload Polaroid"
            className="p-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-medium shadow-md transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
          >
            <ImagePlus size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => toggleDrawer('stickers')}
            title="Decorate with Stickers"
            className={`p-2.5 rounded-full border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
              activeDrawer === 'stickers'
                ? 'bg-indigo-500 border-indigo-400 text-white'
                : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Smile size={18} />
          </button>

          <button
            onClick={() => toggleDrawer('background')}
            title="Change Canvas Background"
            className={`p-2.5 rounded-full border transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
              activeDrawer === 'background'
                ? 'bg-indigo-500 border-indigo-400 text-white'
                : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Palette size={18} />
          </button>
        </div>

        {/* Center: Brand Title */}
        <div className="hidden sm:flex flex-col items-center">
          <span className="text-sm font-bold tracking-widest text-zinc-200 bg-gradient-to-r from-indigo-300 via-rose-300 to-amber-300 bg-clip-text text-transparent uppercase">
            PolaPin Studio
          </span>
          <span className="text-[9px] text-zinc-500 font-mono tracking-widest -mt-0.5">
            Pinterest Polaroid Board
          </span>
        </div>

        {/* Right Actions: Reset, Sound, Export, Save */}
        <div className="flex items-center gap-2">
          {/* Sound Controls */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2 rounded-full bg-zinc-800/40 border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Reset Board */}
          <button
            onClick={() => {
              playSlide();
              if (window.confirm('Clear all polaroids and stickers from board?')) {
                onResetBoard();
              }
            }}
            title="Reset Board"
            className="p-2 rounded-full bg-zinc-800/40 border border-zinc-700/40 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-all"
          >
            <RotateCcw size={15} />
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExport}
            title="Download Collage as PNG"
            className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold shadow-md border border-zinc-700 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Download size={14} /> Export
          </button>

          {/* Save/Share Board */}
          <button
            onClick={onSaveBoard}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-zinc-700 disabled:to-zinc-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Share2 size={14} /> {isSaving ? 'Saving...' : 'Save & Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
