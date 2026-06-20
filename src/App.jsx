import React, { useState, useRef, useEffect } from 'react';
import PolaroidCard from './components/PolaroidCard';
import { useSound } from './hooks/useSound';
import { Download, Volume2, VolumeX, Sparkles, HelpCircle, X, RotateCcw, Calendar, Undo } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

const FRAME_COLORS = [
  { name: 'Classic White', class: 'bg-[#faf9f6]' },
  { name: 'Sage Green', class: 'bg-[#ebeee6]' },
  { name: 'Rose Pink', class: 'bg-[#f8f0f0]' },
  { name: 'Sky Blue', class: 'bg-[#eaf2f6]' },
  { name: 'Warm Sand', class: 'bg-[#f4f0e6]' }
];

const WASHI_TAPES = [
  { name: 'None', value: 'none' },
  { name: 'Peach', value: 'peach' },
  { name: 'Sage', value: 'sage' },
  { name: 'Sky', value: 'sky' },
  { name: 'Amber', value: 'amber' }
];

const FILTERS = ['Normal', 'Vintage', 'Warm', 'Cool', 'Sepia', 'Mono'];
const FONTS = ['Reenie', 'Caveat', 'Kalam'];

export default function App() {
  const { playShutter, playTape, playSlide, playDeveloping } = useSound();

  // App State representing a single Polaroid
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [font, setFont] = useState('Reenie');
  const [filter, setFilter] = useState('Normal');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [cardTilt, setCardTilt] = useState(0); // Slight rotate of the whole card
  const [frameColor, setFrameColor] = useState(FRAME_COLORS[0].class);
  const [washiTape, setWashiTape] = useState('none');
  const [showDate, setShowDate] = useState(true);
  const [date, setDate] = useState('');
  const [isDeveloping, setIsDeveloping] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const exportRef = useRef(null);

  // Formatted date (MM.DD.YY)
  const getFormattedDate = () => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}.${dd}.${yy}`;
  };

  useEffect(() => {
    setDate(getFormattedDate());
  }, []);

  const handleImageUpload = (src) => {
    playShutter();
    setImage(src);
    setPanX(0);
    setPanY(0);
    setZoom(1);
    setIsDeveloping(true);
    setCaption('');
  };

  const handleUpdateCard = (fields) => {
    if (fields.caption !== undefined) setCaption(fields.caption);
    if (fields.panX !== undefined) setPanX(fields.panX);
    if (fields.panY !== undefined) setPanY(fields.panY);
  };

  // Drag and drop image anywhere on screen
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleImageUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Film development timer simulation
  useEffect(() => {
    if (isDeveloping) {
      playDeveloping();
      const timer = setTimeout(() => {
        setIsDeveloping(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isDeveloping]);

  // Clean/Reset board
  const handleReset = () => {
    playSlide();
    setImage(null);
    setCaption('');
    setFilter('Normal');
    setFont('Reenie');
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setCardTilt(0);
    setWashiTape('none');
    setFrameColor(FRAME_COLORS[0].class);
  };

  // Export card as PNG
  const handleDownload = async () => {
    if (!exportRef.current || !image) return;
    playShutter();
    
    try {
      // Small delay to ensure no layout lag
      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 3, // Premium ultra-crisp resolution
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `polaroid-${caption.replace(/\s+/g, '-').toLowerCase() || 'snapshot'}.png`;
      link.href = imgData;
      link.click();

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.75 }
      });
    } catch (e) {
      console.error('Failed to export image', e);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen w-screen relative grain-texture bg-cream-dots flex flex-col justify-between items-center px-4 py-6"
    >
      {/* Header Panel */}
      <header className="w-full max-w-4xl flex justify-between items-center z-10 px-2 select-none">
        <div className="flex flex-col">
          <span className="font-semibold text-stone-900 tracking-wider text-sm font-sans uppercase">
            Polaroid Studio
          </span>
          <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase -mt-0.5">
            Aesthetic Retro generator
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Restart */}
          {image && (
            <button
              onClick={handleReset}
              title="Clear card"
              className="p-2 rounded-full border border-stone-200 hover:bg-white text-stone-500 hover:text-stone-800 transition-colors shadow-sm"
            >
              <RotateCcw size={14} />
            </button>
          )}

          {/* Info trigger */}
          <button
            onClick={() => {
              playSlide();
              setShowInfoModal(true);
            }}
            className="flex items-center gap-1 py-1.5 px-3 border border-stone-200 bg-stone-50 hover:bg-white rounded-full text-[10px] font-bold text-stone-500 hover:text-stone-700 transition-all shadow-sm"
          >
            <HelpCircle size={12} /> Specs
          </button>
        </div>
      </header>

      {/* Main viewport area for the card */}
      <main className="flex-1 flex items-center justify-center py-8 z-10">
        <div
          style={{
            transform: `rotate(${cardTilt}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="relative"
        >
          <PolaroidCard
            image={image}
            caption={caption}
            font={font}
            filter={filter}
            zoom={zoom}
            panX={panX}
            panY={panY}
            frameColor={frameColor}
            washiTape={washiTape}
            showDate={showDate}
            date={date}
            isDeveloping={isDeveloping}
            onImageUpload={handleImageUpload}
            onUpdate={handleUpdateCard}
            exportRef={exportRef}
          />
        </div>
      </main>

      {/* Clean, minimalist controls container at the bottom */}
      <footer className="w-full max-w-xl z-20 flex flex-col items-center gap-4 bg-white/70 backdrop-blur-md border border-stone-200/60 rounded-2xl p-4 shadow-sm select-none">
        
        {/* If no image loaded, show simple instructions */}
        {!image ? (
          <div className="text-center py-2">
            <p className="text-stone-600 text-xs font-medium tracking-wide">
              Drag a picture anywhere on the screen or click the frame to start
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {/* Row 1: Colors & Washi Tapes */}
            <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-3.5">
              {/* Color selectors */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Frame Color</span>
                <div className="flex items-center gap-2">
                  {FRAME_COLORS.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => {
                        playSlide();
                        setFrameColor(col.class);
                      }}
                      title={col.name}
                      className={`w-6 h-6 rounded-full border transition-all ${col.class} ${
                        frameColor === col.class 
                          ? 'ring-2 ring-stone-400 ring-offset-1 border-transparent scale-105' 
                          : 'border-stone-300 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Washi tape selectors */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Washi Tape</span>
                <div className="flex gap-1 overflow-x-auto">
                  {WASHI_TAPES.map((wt) => (
                    <button
                      key={wt.name}
                      onClick={() => {
                        playTape();
                        setWashiTape(wt.value);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        washiTape === wt.value
                          ? 'bg-stone-900 border-stone-900 text-white font-medium'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {wt.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Filters & Font Typography */}
            <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-3.5">
              {/* Filters */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Filter</span>
                <div className="flex gap-1 overflow-x-auto py-0.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-[9px] px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                        filter === f
                          ? 'bg-stone-900 border-stone-900 text-white font-medium'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fonts & Date Stamp Toggle */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Text Options</span>
                <div className="flex gap-1 items-center">
                  {/* Cursive style */}
                  <div className="flex border border-stone-200 rounded overflow-hidden">
                    {FONTS.map((fo) => (
                      <button
                        key={fo}
                        onClick={() => setFont(fo)}
                        className={`text-[9px] px-2 py-0.5 border-r border-stone-200 last:border-0 transition-colors ${
                          font === fo
                            ? 'bg-stone-850 bg-stone-900 text-white'
                            : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        {fo}
                      </button>
                    ))}
                  </div>

                  {/* Date toggle */}
                  <button
                    onClick={() => setShowDate(!showDate)}
                    className={`ml-auto p-1 border rounded transition-colors ${
                      showDate 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                    title="Toggle Date stamp"
                  >
                    <Calendar size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Adjustments Sliders */}
            <div className="grid grid-cols-2 gap-4 pb-1">
              {/* Zoom Scale */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] text-stone-400 font-mono uppercase tracking-wider">
                  <span>Photo Zoom</span>
                  <span className="text-stone-500">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
                />
              </div>

              {/* Card Tilt */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] text-stone-400 font-mono uppercase tracking-wider">
                  <span>Card Tilt</span>
                  <span className="text-stone-500">{cardTilt}°</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={cardTilt}
                  onChange={(e) => setCardTilt(parseInt(e.target.value))}
                  className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
            >
              <Download size={14} /> Download Polaroid Card
            </button>
          </div>
        )}
      </footer>

      {/* Screen drag drop overlay feedback */}
      {isDragOver && (
        <div className="absolute inset-0 bg-stone-100/80 backdrop-blur-sm pointer-events-none flex flex-col items-center justify-center z-50 border-4 border-dashed border-stone-300 m-4 rounded-2xl animate-fadeIn">
          <Sparkles size={48} className="text-stone-400 animate-pulse mb-3" />
          <h2 className="text-lg font-semibold text-stone-800 tracking-wide">Drop to develop your photo</h2>
          <p className="text-stone-400 text-xs mt-0.5">Supports PNG, JPG & WebP</p>
        </div>
      )}

      {/* Specification Detail Overlay Modal */}
      {showInfoModal && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#faf8f4] border border-stone-200 w-full max-w-md rounded-2xl p-6 shadow-xl animate-scaleUp text-left select-text">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-stone-900 tracking-wider uppercase text-sm">PolaStudio Specs</h3>
                <p className="text-[9px] font-mono tracking-widest text-stone-400 uppercase -mt-0.5">Aesthetic Enhancement log</p>
              </div>
              <button
                onClick={() => {
                  playSlide();
                  setShowInfoModal(false);
                }}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-600 leading-relaxed font-sans">
              <p>
                This project mimics the clean, fresh, single-card utility of Michelle Liu's original website but adds modern, elegant Pinterest-inspired specs:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-500">
                <li><strong>Interactive Zoom & Pan</strong>: Scroll scale slider and direct click-dragging to pan/crop inside the photo viewport.</li>
                <li><strong>Aesthetic Themes</strong>: Swap frame backing colors (classic white, sage green, blush rose, ocean blue, and vintage sand).</li>
                <li><strong>Washi Tape Toggles</strong>: Tape the top of the polaroid card with 4 pastel translucent washi stripes.</li>
                <li><strong>Chemical Developing Film</strong>: Realistic 3-second fading blur and brightness simulation.</li>
                <li><strong>Synth Sound Engine</strong>: Crisp camera shutter clicks and tape tearing effects programmatically built in-browser via the Web Audio API.</li>
                <li><strong>Ultra-Crisp Export</strong>: Standard 3x upscale canvas compiling for high-quality downloads with confetti reactions.</li>
              </ul>
            </div>

            <div className="border-t border-stone-200/80 pt-4 mt-4 flex justify-between items-center text-[10px] font-mono text-stone-400">
              <span>Frontend Vercel Optimized</span>
              <a 
                href="https://github.com/vidhyawalke/Poloroid-studio"
                target="_blank"
                rel="noreferrer"
                className="text-stone-600 hover:underline font-semibold"
              >
                Github Repo
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
