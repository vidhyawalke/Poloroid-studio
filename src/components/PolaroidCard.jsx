import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';

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
  { name: 'Kalam', class: 'font-kalam text-2xl font-normal' },
  { name: 'Default', class: 'font-mono text-base tracking-normal' }
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
  textColor,
  showDate,
  date,
  isDeveloping,
  onImageUpload,
  onUpdate,
  exportRef
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  const clampPan = (x, y, currentZoom) => {
    const maxPanX = Math.max(0, (300 * currentZoom - 300) / 2);
    const maxPanY = Math.max(0, (300 * currentZoom - 300) / 2);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y))
    };
  };

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
    
    const targetX = panStart.current.x + dx;
    const targetY = panStart.current.y + dy;
    
    const clamped = clampPan(targetX, targetY, zoom);
    onUpdate({
      panX: clamped.x,
      panY: clamped.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (!image || isDeveloping) return;
    e.preventDefault();
    const zoomStep = 0.05;
    const newZoom = Math.max(1.0, Math.min(3.0, zoom + (e.deltaY < 0 ? zoomStep : -zoomStep)));
    
    const clamped = clampPan(panX, panY, newZoom);
    onUpdate({ 
      zoom: newZoom,
      panX: clamped.x,
      panY: clamped.y
    });
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
  }, [isDragging, zoom, panX, panY]);

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
    const fontObj = FONTS.find(f => f.name === font) || FONTS[3];
    return fontObj.class;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Physical single Polaroid card */}
      <div
        ref={exportRef}
        className="relative w-[340px] p-5 pb-12 shadow-card hover:shadow-card-hover rounded-sm border border-stone-200/20 transition-all duration-300 flex flex-col items-center select-none"
        style={{ backgroundColor: frameColor }}
      >
        {/* Polaroid Inner Frame (Viewport) */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onWheel={handleWheel}
          onMouseEnter={() => image && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-[300px] h-[300px] border border-stone-200/20 overflow-hidden flex items-center justify-center cursor-pointer rounded-[1px]"
          style={{ backgroundColor: frameColor }}
        >
          {image ? (
            <>
              <div
                onMouseDown={handleMouseDown}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                }}
              >
                <img
                  src={image}
                  alt="Polaroid source"
                  draggable="false"
                  className={`w-full h-full object-contain select-none pointer-events-none ${getFilterCSS()} ${
                    isDeveloping ? 'animate-develop' : ''
                  }`}
                />
              </div>

              {isHovered && !isDeveloping && (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center animate-fadeIn pointer-events-none">
                  <div className="bg-white/95 text-stone-700 text-[10px] font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5 border border-stone-100">
                    <Upload size={12} className="stroke-[2.5]" />
                    <span>Upload New</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center text-center p-6 text-stone-400 hover:text-stone-500 transition-colors pointer-events-none select-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-12 h-12 mb-3 text-stone-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <p className="text-xs font-semibold tracking-wider uppercase text-stone-400">Click to load photo</p>
              <p className="text-[10px] text-stone-400/80 mt-1">Scroll to Zoom • Drag to Crop</p>
            </div>
          )}

          {/* Developing chemical overlay */}
          {image && isDeveloping && (
            <div className="absolute inset-0 bg-[#0e0e0d]/10 backdrop-blur-[2px] pointer-events-none mix-blend-color-burn flex items-center justify-center">
              <span className="text-[10px] font-mono text-white bg-black/40 py-1.5 px-3.5 rounded tracking-widest uppercase">
                Developing...
              </span>
            </div>
          )}
        </div>

        {/* Polaroid caption & date baseline line container */}
        <div className="w-full mt-4.5 px-1 flex flex-col justify-start select-text">
          <div className="flex justify-between items-end border-b border-stone-200/80 pb-1.5 w-full min-h-[2.4rem] relative">
            {isEditing ? (
              <input
                type="text"
                value={caption}
                onChange={(e) => onUpdate({ caption: e.target.value })}
                autoFocus
                maxLength={32}
                placeholder="Write a caption..."
                className={`bg-transparent border-0 outline-none flex-1 min-w-0 ${getFontClass()} pb-0`}
                style={{ color: textColor }}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditing(false);
                }}
              />
            ) : (
              <div
                onClick={() => image && setIsEditing(true)}
                className={`break-words flex-1 min-w-0 pr-2 cursor-text ${getFontClass()}`}
                style={{ color: textColor }}
              >
                {caption || (image ? <span className="text-stone-300 italic text-sm font-sans tracking-normal select-none">Click to add caption...</span> : '')}
              </div>
            )}

            {/* Date Stamp */}
            {showDate && (
              <div 
                className="font-date text-sm tracking-wide select-none whitespace-nowrap pl-2"
                style={{ color: textColor === '#ffffff' ? '#e0e0e0' : '#78716c' }}
              >
                {date}
              </div>
            )}
          </div>
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
