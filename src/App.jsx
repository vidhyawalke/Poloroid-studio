import React, { useState, useRef, useEffect } from 'react';
import PolaroidCard from './components/PolaroidCard';
import { useSound } from './hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  RotateCcw, 
  Share2, 
  Download, 
  Link as LinkIcon, 
  X, 
  HelpCircle, 
  Type, 
  ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

const DOT_COLORS = [
  { name: 'Red', hex: '#ff6c6c', bg: '#ffd9d9' },
  { name: 'Orange', hex: '#ffa85e', bg: '#ffead9' },
  { name: 'Yellow', hex: '#ffde43', bg: '#fffad9' },
  { name: 'Green', hex: '#69db88', bg: '#d6f5df' },
  { name: 'Cyan', hex: '#48d6d6', bg: '#daf9f9' },
  { name: 'Blue', hex: '#57a8ff', bg: '#e0eeff' },
  { name: 'Purple', hex: '#8b8bff', bg: '#e5e5ff' }
];

const FONTS = ['Default', 'Reenie', 'Caveat', 'Kalam'];

export default function App() {
  const { playShutter, playTape, playSlide, playDeveloping } = useSound();

  // Polaroid State
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [font, setFont] = useState('Default');
  const [filter, setFilter] = useState('Normal');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [frameColor, setFrameColor] = useState('#ffffff');
  const [activeColorName, setActiveColorName] = useState('White');
  const [showDate, setShowDate] = useState(true);
  const [date, setDate] = useState('');
  const [isDeveloping, setIsDeveloping] = useState(false);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy Link');

  const exportRef = useRef(null);

  // Format date (MM.DD.YY)
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
    if (fields.zoom !== undefined) setZoom(fields.zoom);
  };

  const handleColorClick = (color) => {
    playSlide();
    if (activeColorName === color.name) {
      setFrameColor('#ffffff');
      setActiveColorName('White');
    } else {
      setFrameColor(color.bg);
      setActiveColorName(color.name);
    }
  };

  const cycleFont = () => {
    playSlide();
    const nextIndex = (FONTS.indexOf(font) + 1) % FONTS.length;
    setFont(FONTS[nextIndex]);
  };

  const handleRestart = () => {
    playSlide();
    setImage(null);
    setCaption('');
    setFilter('Normal');
    setFont('Default');
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setFrameColor('#ffffff');
    setActiveColorName('White');
  };

  const handleDownload = async () => {
    if (!exportRef.current || !image) return;
    playShutter();
    try {
      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 3,
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `polaroid-${caption.trim().replace(/\s+/g, '-').toLowerCase() || 'snapshot'}.png`;
      link.href = imgData;
      link.click();
      
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyLink = () => {
    playTape();
    navigator.clipboard.writeText(window.location.href);
    setCopyStatus('Copied!');
    setTimeout(() => {
      setCopyStatus('Copy Link');
    }, 2000);
  };

  useEffect(() => {
    if (isDeveloping) {
      playDeveloping();
      const timer = setTimeout(() => {
        setIsDeveloping(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isDeveloping]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#f0f5fa] to-[#e1eaf2] flex flex-col justify-between items-center px-4 py-8 relative font-sans select-none overflow-x-hidden">
      
      {/* Specs modal trigger */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <button
          onClick={() => {
            playSlide();
            setShowSpecsModal(true);
          }}
          className="w-9 h-9 rounded-full border border-stone-200/50 bg-white/70 hover:bg-white flex items-center justify-center text-stone-500 hover:text-stone-700 transition-all shadow-sm active:scale-95"
          title="Project Specs"
        >
          <HelpCircle size={16} />
        </button>
      </div>

      {/* Website Logo Title */}
      <header className="text-center mt-3 z-10 select-none">
        <h1 className="text-[34px] tracking-wide leading-none font-sans font-light select-none">
          <span className="text-[#20242d] font-normal">Polaroid </span>
          <span className="text-[#a0aec0] font-light">Studio</span>
        </h1>
      </header>

      {/* Main Centered Polaroid Card */}
      <main className="flex-1 flex items-center justify-center my-6 z-10">
        <motion.div
          key={image ? 'loaded' : 'empty'}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 90 }}
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
            showDate={showDate}
            date={date}
            isDeveloping={isDeveloping}
            onImageUpload={handleImageUpload}
            onUpdate={handleUpdateCard}
            exportRef={exportRef}
          />
        </motion.div>
      </main>

      {/* Controls and Actions (exactly matching Screenshot 4 & 5 layout) */}
      <div className="flex flex-col items-center gap-5.5 w-full max-w-xl z-10">
        
        {/* Floating pill control bar */}
        {image && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-full px-5 py-2 shadow-sm border border-stone-200/20 flex items-center gap-4.5"
          >
            {/* 7 Color circles */}
            <div className="flex items-center gap-2">
              {DOT_COLORS.map((col) => (
                <button
                  key={col.name}
                  onClick={() => handleColorClick(col)}
                  style={{ backgroundColor: col.hex }}
                  className={`w-6.5 h-6.5 rounded-full border border-stone-200/40 hover:scale-105 active:scale-95 transition-all shadow-sm ${
                    activeColorName === col.name 
                      ? 'ring-2 ring-[#0070f3] ring-offset-1 scale-105' 
                      : ''
                  }`}
                  title={col.name}
                />
              ))}
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-5 bg-stone-200" />

            {/* Date Calendar Toggle Button */}
            <button
              onClick={() => {
                playSlide();
                setShowDate(!showDate);
              }}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                showDate 
                  ? 'bg-[#0070f3] border-transparent text-white shadow-sm' 
                  : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
              title="Toggle Date"
            >
              <Calendar size={15} />
            </button>

            {/* Font Style Toggle Button */}
            <button
              onClick={cycleFont}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                font !== 'Default' 
                  ? 'bg-[#0070f3] border-transparent text-white shadow-sm' 
                  : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
              title={`Current Font: ${font}`}
            >
              <Type size={15} />
            </button>
          </motion.div>
        )}

        {/* Restart & Share bottom bar */}
        {image && (
          <div className="flex items-center gap-8 mt-1">
            <button
              onClick={handleRestart}
              className="text-[#a0aec0] hover:text-stone-600 font-medium text-sm flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <RotateCcw size={14} className="stroke-[2.5]" />
              <span>Restart</span>
            </button>

            <button
              onClick={() => {
                playSlide();
                setShowShareModal(true);
              }}
              className="bg-black hover:bg-stone-850 active:scale-98 text-white px-7 py-2 rounded-full text-xs font-semibold tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Share2 size={13} className="stroke-[2.5]" />
              <span>Share</span>
            </button>
          </div>
        )}
      </div>

      {/* SHARE MODAL POPUP (iOS Share Sheet) */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-stone-900/25 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl relative border border-stone-100/50"
            >
              <button
                onClick={() => {
                  playSlide();
                  setShowShareModal(false);
                }}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-50 transition-all"
              >
                <X size={16} />
              </button>

              <h3 className="text-base font-semibold text-stone-850 mb-6">Share Polaroid</h3>

              {/* Mockup Preview Card */}
              <div 
                className="w-[170px] p-3 pb-8 rounded-sm shadow-md mx-auto mb-6 scale-[0.95] flex flex-col items-center border border-stone-200/40"
                style={{ backgroundColor: frameColor }}
              >
                <div className="w-[146px] h-[146px] bg-[#f5f2eb] border border-stone-200/20 overflow-hidden flex items-center justify-center">
                  {image && (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="w-full text-stone-800 text-[10px] text-center font-mono mt-2 overflow-hidden truncate">
                  {caption || 'Snapshot'}
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  onClick={handleCopyLink}
                  className="rounded-2xl border border-stone-100 p-4 bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/10 flex items-center justify-center text-stone-600">
                    <LinkIcon size={16} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold mt-2.5">{copyStatus}</span>
                </div>

                <div
                  onClick={() => {
                    setShowShareModal(false);
                    handleDownload();
                  }}
                  className="rounded-2xl border border-stone-100 p-4 bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/10 flex items-center justify-center text-stone-600">
                    <Download size={16} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold mt-2.5">Download</span>
                </div>
              </div>

              {/* iOS Share Sheet */}
              <div className="flex justify-between items-center px-1 border-t border-stone-100 pt-5">
                <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white font-semibold">
                    📸
                  </div>
                  <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600 mt-0.5">Instagram</span>
                </button>

                <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-[#0077b5] flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white text-xs font-mono font-bold">
                    in
                  </div>
                  <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600 mt-0.5">LinkedIn</span>
                </button>

                <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-[#0084ff] flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white">
                    ✉️
                  </div>
                  <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600 mt-0.5">Mail</span>
                </button>

                <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white font-bold font-mono text-sm">
                    X
                  </div>
                  <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600 mt-0.5">X</span>
                </button>

                <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-xl bg-[#4cd964] flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white text-base">
                    💬
                  </div>
                  <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600 mt-0.5">Messages</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SPECS MODAL (Image 4 specifications popup) */}
      <AnimatePresence>
        {showSpecsModal && (
          <div className="fixed inset-0 bg-stone-900/25 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-[28px] p-8 max-w-xl w-full shadow-2xl relative border border-stone-100/50"
            >
              <button
                onClick={() => {
                  playSlide();
                  setShowSpecsModal(false);
                }}
                className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-50 transition-all z-20"
              >
                <X size={16} />
              </button>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-stone-850 flex items-center gap-1.5">
                  <span>Polaroid Studio</span>
                  <span className="text-stone-300 font-normal">•</span>
                  <span className="text-stone-400 font-normal">2025</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">A digital way to customize your own polaroid.</p>
              </div>

              <div className="grid grid-cols-4 gap-4 border-t border-stone-100 pt-5 mb-6 text-xs leading-normal">
                <div>
                  <span className="text-stone-400 block mb-1">Design</span>
                  <span className="text-stone-600 font-medium">Figma</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">Frontend</span>
                  <div className="text-stone-600 font-medium flex flex-col gap-0.5">
                    <span>TypeScript</span>
                    <span>React</span>
                    <span>Vite</span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">Styling</span>
                  <span className="text-stone-600 font-medium">Tailwind CSS</span>
                </div>
                <div>
                  <span className="text-stone-400 block mb-1">AI</span>
                  <div className="text-stone-600 font-medium flex flex-col gap-0.5">
                    <span>Figma Make</span>
                    <span>Cursor</span>
                    <span>Opus 4.5</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-b from-[#eaf0f6] to-[#dce6f0] p-6 flex flex-col items-center justify-center border border-stone-100 select-none">
                <span className="text-[#a0aec0] text-[10px] font-semibold tracking-wider mb-4 uppercase">Polaroid Studio</span>
                
                {/* Mockup Card */}
                <div 
                  className="w-[120px] p-2 pb-5 border border-stone-200/35 rounded-sm shadow-md flex flex-col items-center mb-3 transition-colors duration-300"
                  style={{ backgroundColor: frameColor }}
                >
                  <div className="w-[104px] h-[104px] bg-[#dce6f0] border border-stone-100" />
                  <div className="w-12 h-1.5 bg-stone-200 mt-2 rounded-full" />
                </div>

                {/* Simulated colors dot picker bar */}
                <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm border border-stone-200/10">
                  {DOT_COLORS.map((c) => (
                    <div
                      key={c.name}
                      style={{ backgroundColor: c.hex }}
                      className="w-2.5 h-2.5 rounded-full border border-stone-100/50"
                    />
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
