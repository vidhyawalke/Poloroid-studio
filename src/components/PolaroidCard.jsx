import React, { useState, useRef, useEffect } from 'react';
import { Type, HelpCircle, AlertCircle } from 'lucide-react';

const FILTERS = [
  { name: 'Normal', class: 'brightness-100 contrast-100 saturate-100' },
  { name: 'Vintage', class: 'brightness-95 contrast-[1.05] sepia-[0.25] saturate-[0.9]' },
  { name: 'Warm', class: 'brightness-95 contrast-[1.02] saturate-110 sepia-[0.12] hue-rotate-[4deg]' },
  { name: 'Cool', class: 'brightness-[1.02] contrast-95 saturate-90 hue-rotate-[-6deg]' },
  { name: 'Sepia', class: 'sepia-[0.8] contrast-90 brightness-[0.98]' },
  { name: 'Mono', class: 'grayscale brightness-105 contrast-[1.15]' },
];

const FONTS = [
  { name: 'Reenie', class: 'font-reenie text-4xl' },
  { name: 'Caveat', class: 'font-caveat text-3xl font-medium' },
  { name: 'Kalam', class: 'font-kalam text-2xl' },
];

export default function PolaroidCard({
  image,
  caption,
  font,
  filter,
  zoom,
  panX,
  panY,
  frameColor,
  washiTape,
  showDate,
  date,
  isDeveloping,
  onImageUpload,
  onUpdate,
  exportRef
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  // Handle Drag to Pan within the picture frame
  const handleMouseDown = (e) => {
    if (!image || isDeveloping) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: panX, y: panY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    onUpdate({
      panX: panStart.current.x + dx,
      panY: panStart.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFilterCSS = () => {
    const filterObj = FILTERS.find(f => f.name === filter) || FILTERS[0];
    return filterObj.class;
  };

  const getFontClass = () => {
    const fontObj = FONTS.find(f => f.name === font) || FONTS[0];
    return fontObj.class;
  };

  const getWashiTapeCSS = () => {
    switch (washiTape) {
      case 'peach':
        return 'bg-rose-300/40 border-rose-400/20 text-rose-800/50';
      case 'sage':
        return 'bg-emerald-200/40 border-emerald-300/20 text-emerald-800/50';
      case 'sky':
        return 'bg-sky-200/40 border-sky-300/20 text-sky-800/50';
      case 'amber':
        return 'bg-amber-200/40 border-amber-300/20 text-amber-800/50';
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Physical single Polaroid card */}
      <div
        ref={exportRef}
        className={`relative w-[340px] p-5 pb-16 bg-[#faf9f6] shadow-card hover:shadow-card-hover rounded-sm border border-stone-200/40 transition-all duration-300 flex flex-col items-center ${frameColor}`}
      >
        {/* Washi Tape overlay */}
        {washiTape !== 'none' && getWashiTapeCSS() && (
          <div
            className={`absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-7 border border-dashed text-[10px] tracking-widest font-mono flex items-center justify-center rotate-1 select-none pointer-events-none z-30 washi-tape ${getWashiTapeCSS()}`}
            style={{ mixBlendMode: 'multiply' }}
          >
            ✦ • ✦ • ✦
          </div>
        )}

        {/* Polaroid Inner Frame (Viewport) */}
        <div
          onClick={() => !image && fileInputRef.current?.click()}
          className="relative w-[300px] h-[300px] bg-[#ebe7df] border border-stone-300/50 overflow-hidden flex items-center justify-center cursor-pointer rounded-[1px] group"
        >
          {image ? (
            <div
              onMouseDown={handleMouseDown}
              className="absolute inset-0 cursor-move"
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              <img
                src={image}
                alt="Polaroid source"
                draggable="false"
                className={`w-full h-full object-cover select-none pointer-events-none ${getFilterCSS()} ${
                  isDeveloping ? 'animate-develop' : ''
                }`}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6 text-stone-500 hover:text-stone-700 transition-colors pointer-events-none select-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-12 h-12 mb-3 text-stone-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <p className="text-xs font-medium tracking-wide uppercase">Click to Load Image</p>
              <p className="text-[10px] text-stone-400 mt-1">or drag & drop file here</p>
            </div>
          )}

          {/* Film Developing Chemistry HUD */}
          {image && isDeveloping && (
            <div className="absolute inset-0 bg-[#0e0e0d]/10 backdrop-blur-[2px] pointer-events-none mix-blend-color-burn flex items-center justify-center">
              <span className="text-[10px] font-mono text-white bg-black/35 py-1 px-2.5 rounded tracking-widest uppercase">
                Developing...
              </span>
            </div>
          )}
        </div>

        {/* Polaroid caption input */}
        <div className="w-full mt-5 flex flex-col justify-start px-2 relative">
          {isEditing ? (
            <input
              type="text"
              value={caption}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              autoFocus
              maxLength={36}
              placeholder="Write a caption..."
              className={`w-full bg-transparent border-b border-stone-300 outline-none text-stone-800 ${getFontClass()} pb-1`}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false);
              }}
            />
          ) : (
            <div
              onClick={() => image && setIsEditing(true)}
              className={`w-full text-stone-800 tracking-wide break-words line-clamp-1 py-1 cursor-text min-h-[2.2rem] ${getFontClass()}`}
            >
              {caption || (image ? <span className="text-stone-400/70 italic text-sm font-sans tracking-normal">Click to add text...</span> : '')}
            </div>
          )}

          {/* Autogenerated Courier Date Stamp */}
          {showDate && (
            <div className="absolute bottom-1 right-2 font-date text-xs text-stone-400 tracking-wider">
              {date}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
