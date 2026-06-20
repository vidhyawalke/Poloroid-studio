import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Trash2, RotateCw, ZoomIn, ZoomOut, Check, Type, Sparkles } from 'lucide-react';
import { useSound } from '../hooks/useSound';

const FILTERS = [
  { name: 'Normal', class: 'brightness-100 contrast-100 saturate-100' },
  { name: 'Vintage', class: 'brightness-95 contrast-110 sepia-[0.35] saturate-[0.85]' },
  { name: 'Warm Retro', class: 'brightness-95 contrast-105 saturate-110 sepia-[0.15] hue-rotate-[5deg]' },
  { name: 'Cool Film', class: 'brightness-100 contrast-95 saturate-90 hue-rotate-[-8deg] contrast-[0.95]' },
  { name: 'Sepia', class: 'sepia contrast-90 brightness-95' },
  { name: 'Mono', class: 'grayscale brightness-105 contrast-125' },
];

const FONTS = [
  { name: 'Reenie', class: 'font-reenie text-3xl' },
  { name: 'Caveat', class: 'font-caveat text-2xl' },
  { name: 'Kalam', class: 'font-kalam text-xl' },
  { name: 'Shadows', class: 'font-shadows text-xl' },
];

export default function PolaroidCard({
  card,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
  canvasRef
}) {
  const { playTape, playDeveloping } = useSound();
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isDeveloping, setIsDeveloping] = useState(card.isDeveloping ?? false);
  
  const imageRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panStartPos = useRef({ x: 0, y: 0 });

  // Handle film developing effect
  useEffect(() => {
    if (isDeveloping) {
      playDeveloping();
      const timer = setTimeout(() => {
        setIsDeveloping(false);
        onUpdate(card.id, { isDeveloping: false });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isDeveloping]);

  // Handle inline caption changes
  const handleCaptionChange = (e) => {
    onUpdate(card.id, { caption: e.target.value });
  };

  // Image Drag to Pan (crop adjustment)
  const handleImageMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingImage(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    panStartPos.current = { x: card.panX || 0, y: card.panY || 0 };
  };

  const handleImageMouseMove = (e) => {
    if (!isDraggingImage) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    
    // Scale sensitivity by current zoom
    const zoomFactor = card.zoom || 1;
    onUpdate(card.id, {
      panX: panStartPos.current.x + dx,
      panY: panStartPos.current.y + dy
    });
  };

  const handleImageMouseUp = () => {
    setIsDraggingImage(false);
  };

  useEffect(() => {
    if (isDraggingImage) {
      window.addEventListener('mousemove', handleImageMouseMove);
      window.addEventListener('mouseup', handleImageMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleImageMouseMove);
      window.removeEventListener('mouseup', handleImageMouseUp);
    };
  }, [isDraggingImage]);

  // Rotate card by 15 degree increments
  const handleQuickRotate = (e) => {
    e.stopPropagation();
    playTape();
    const currentRot = card.rotation || 0;
    let nextRot = currentRot + 15;
    if (nextRot >= 360) nextRot = 0;
    onUpdate(card.id, { rotation: nextRot });
  };

  // Toggle layout selectors
  const toggleToolbar = (e) => {
    e.stopPropagation();
    setShowToolbar(!showToolbar);
  };

  const getFilterCSS = () => {
    const filterObj = FILTERS.find(f => f.name === card.filter) || FILTERS[0];
    return filterObj.class;
  };

  const getFontClass = () => {
    const fontObj = FONTS.find(f => f.name === card.font) || FONTS[0];
    return fontObj.class;
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={canvasRef}
      onDragStart={() => {
        onSelect();
        setShowToolbar(false);
      }}
      onDragEnd={(e, info) => {
        // Retrieve current transform matrix/offset to set state
        const rect = e.target.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        // Update new positions relative to canvas
        onUpdate(card.id, {
          x: rect.left - canvasRect.left + (rect.width * 0.1),
          y: rect.top - canvasRect.top + (rect.height * 0.1)
        });
      }}
      onTapStart={onSelect}
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        rotate: `${card.rotation || 0}deg`,
        zIndex: isSelected ? 50 : 10,
        touchAction: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isEditingCaption) setShowToolbar(false);
      }}
      className={`group relative w-64 bg-stone-50 p-4 pb-14 shadow-polaroid hover:shadow-polaroid-hover transition-shadow duration-300 rounded-sm border border-stone-200/50 cursor-grab active:cursor-grabbing flex flex-col items-center ${
        isSelected ? 'ring-2 ring-indigo-500/40 ring-offset-2 ring-offset-stone-100' : ''
      }`}
    >
      {/* Tape decoration at the top of the polaroid, optional visual touch */}
      {card.hasTape && (
        <div 
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-24 h-6 washi-tape rotate-1 bg-amber-200/40 border border-dashed border-amber-300/40"
          style={{ mixBlendMode: 'multiply' }}
        />
      )}

      {/* Action Buttons (visible on hover) */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
          <button
            onClick={handleQuickRotate}
            title="Rotate card"
            className="p-1.5 rounded-full bg-white/90 text-stone-700 shadow-sm border border-stone-200/80 hover:bg-stone-100 transition-colors"
          >
            <RotateCw size={12} />
          </button>
          <button
            onClick={toggleToolbar}
            title="Edit card styling"
            className="p-1.5 rounded-full bg-white/90 text-stone-700 shadow-sm border border-stone-200/80 hover:bg-stone-100 transition-colors"
          >
            <Sparkles size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            title="Delete card"
            className="p-1.5 rounded-full bg-rose-500/90 text-white shadow-sm hover:bg-rose-600 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Main Image Viewport (Square Box) */}
      <div className="relative w-56 h-56 bg-stone-900 border border-stone-300/40 overflow-hidden flex items-center justify-center rounded-sm">
        <div
          onMouseDown={handleImageMouseDown}
          className="absolute inset-0 cursor-move flex items-center justify-center"
          style={{
            transform: `translate(${card.panX || 0}px, ${card.panY || 0}px) scale(${card.zoom || 1})`,
            transition: isDraggingImage ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <img
            ref={imageRef}
            src={card.imageUrl}
            alt="Polaroid snapshot"
            draggable="false"
            className={`w-full h-full object-cover select-none pointer-events-none ${getFilterCSS()} ${
              isDeveloping ? 'animate-develop' : ''
            }`}
          />
        </div>

        {/* Developing chemical overlay */}
        {isDeveloping && (
          <div className="absolute inset-0 bg-stone-950/20 backdrop-blur-[3px] pointer-events-none mix-blend-color-burn flex flex-col items-center justify-center">
            <span className="text-white/60 text-xs font-mono font-medium tracking-widest uppercase bg-stone-950/40 py-1 px-2 rounded backdrop-blur-sm">
              Developing...
            </span>
          </div>
        )}
      </div>

      {/* Bottom section (Caption & Date) */}
      <div className="w-full mt-4 flex flex-col justify-start px-1 select-text">
        {/* Caption */}
        {isEditingCaption ? (
          <div className="flex items-center gap-1 w-full border-b border-indigo-400">
            <input
              type="text"
              value={card.caption}
              onChange={handleCaptionChange}
              autoFocus
              maxLength={45}
              placeholder="Write a caption..."
              className={`w-full bg-transparent outline-none text-stone-800 ${getFontClass()} pb-0.5`}
              onBlur={() => setIsEditingCaption(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingCaption(false);
              }}
            />
            <button onClick={() => setIsEditingCaption(false)} className="text-emerald-600">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
              setIsEditingCaption(true);
            }}
            className={`w-full text-stone-800 break-words line-clamp-2 cursor-pointer hover:bg-stone-200/40 rounded px-1 -mx-1 py-0.5 min-h-[1.75rem] ${getFontClass()} leading-tight`}
          >
            {card.caption || <span className="text-stone-400 italic text-sm">Add caption...</span>}
          </div>
        )}

        {/* Date Stamp */}
        {card.showDate && (
          <div className="absolute bottom-3.5 right-4 font-date text-xs text-stone-500 tracking-wider">
            {card.date}
          </div>
        )}
      </div>

      {/* Floating Toolbar Controls */}
      {showToolbar && (
        <div
          onMouseDown={(e) => e.stopPropagation()} // Prevent card drag trigger
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 glass-dark text-white rounded-lg p-2.5 shadow-2xl flex flex-col gap-2 z-50 animate-fadeIn"
        >
          {/* Zoom Slider */}
          <div className="flex items-center gap-2 justify-between">
            <ZoomOut size={12} className="text-zinc-400" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={card.zoom || 1}
              onChange={(e) => onUpdate(card.id, { zoom: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <ZoomIn size={12} className="text-zinc-400" />
          </div>

          {/* Filters Row */}
          <div className="flex gap-1 overflow-x-auto pb-1 select-none">
            {FILTERS.map((f) => (
              <button
                key={f.name}
                onClick={() => onUpdate(card.id, { filter: f.name })}
                className={`text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap ${
                  card.filter === f.name
                    ? 'bg-indigo-500 border-indigo-400 text-white font-medium'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Fonts Row */}
          <div className="flex gap-1 items-center justify-between border-t border-zinc-800 pt-1.5">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Type size={10} /> Font
            </span>
            <div className="flex gap-1 select-none">
              {FONTS.map((font) => (
                <button
                  key={font.name}
                  onClick={() => onUpdate(card.id, { font: font.name })}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    card.font === font.name
                      ? 'bg-indigo-500 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
