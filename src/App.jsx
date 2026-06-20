import React, { useState, useRef, useEffect } from 'react';
import PolaroidCard from './components/PolaroidCard';
import { useSound } from './hooks/useSound';
import { 
  Calendar, 
  RotateCcw, 
  Share2, 
  Download, 
  Link as LinkIcon, 
  X, 
  HelpCircle, 
  Type, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

const DOT_COLORS = [
  { name: 'Red', hex: '#ff6c6c' },
  { name: 'Orange', hex: '#ffa85e' },
  { name: 'Yellow', hex: '#ffde43' },
  { name: 'Green', hex: '#69db88' },
  { name: 'Cyan', hex: '#48d6d6' },
  { name: 'Blue', hex: '#57a8ff' },
  { name: 'Purple', hex: '#8b8bff' },
  { name: 'White', hex: '#ffffff' }
];

const FILTERS = ['Normal', 'Vintage', 'Warm', 'Cool', 'Sepia', 'Mono'];
const FONTS = ['Reenie', 'Caveat', 'Kalam'];

export default function App() {
  const { playShutter, playTape, playSlide, playDeveloping } = useSound();

  // Polaroid State
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [font, setFont] = useState('Reenie');
  const [filter, setFilter] = useState('Normal');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [frameColor, setFrameColor] = useState('#ffffff');
  const [showDate, setShowDate] = useState(true);
  const [date, setDate] = useState('');
  const [isDeveloping, setIsDeveloping] = useState(false);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy Link');

  const exportRef = useRef(null);

  // Format Date
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

  const handleRestart = () => {
    playSlide();
    setImage(null);
    setCaption('');
    setFilter('Normal');
    setFont('Reenie');
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setFrameColor('#ffffff');
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
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#f0f5fa] to-[#e1eaf2] flex flex-col justify-between items-center px-4 py-10 relative font-sans select-none">
      
      {/* Top Header specs button */}
      <div className="absolute top-8 right-8 flex items-center gap-3 z-20">
        <button
          onClick={() => {
            playSlide();
            setShowSpecsModal(true);
          }}
          className="w-9 h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-all shadow-sm"
          title="Project Specs"
        >
          <HelpCircle size={16} />
        </button>
      </div>

      {/* Center Top Page Title (Image 3 style - clean & bold size) */}
      <header className="text-center mt-3 z-10 select-none">
        <h1 className="text-[34px] tracking-wide leading-none font-sans font-light">
          <span className="text-[#20242d] font-normal">Polaroid </span>
          <span className="text-[#a0aec0] font-light">Studio</span>
        </h1>
      </header>

      {/* Main Centered Polaroid Card Display Area */}
      <main className="flex-1 flex items-center justify-center my-8 z-10">
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
      </main>

      {/* Controls & Actions Container */}
      <div className="flex flex-col items-center gap-6 w-full max-w-xl z-10">
        
        {/* Aesthetic floating control deck - clean rows with proper spacing */}
        {image && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/40 w-full flex flex-col gap-4.5 animate-slideUp">
            
            {/* Color preset dots & Custom color picker row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-mono font-medium tracking-widest uppercase">Card Color</span>
              <div className="flex items-center gap-2">
                {DOT_COLORS.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => {
                      playSlide();
                      setFrameColor(col.hex);
                    }}
                    style={{ backgroundColor: col.hex }}
                    className={`w-5.5 h-5.5 rounded-full border border-stone-200/50 hover:scale-105 active:scale-95 transition-all shadow-sm ${
                      frameColor.toLowerCase() === col.hex.toLowerCase()
                        ? 'ring-2 ring-stone-400 ring-offset-1 scale-105' 
                        : ''
                    }`}
                    title={col.name}
                  />
                ))}
                {/* Rainbow Color Picker Button */}
                <div 
                  className="w-5.5 h-5.5 rounded-full border border-stone-300 bg-gradient-to-tr from-red-400 via-green-400 to-blue-400 hover:scale-105 active:scale-95 transition-all relative cursor-pointer shadow-sm"
                  title="Custom Color"
                >
                  <input
                    type="color"
                    value={frameColor.startsWith('#') ? frameColor : '#ffffff'}
                    onChange={(e) => setFrameColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Photo Filters Row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-mono font-medium tracking-widest uppercase">Photo Effect</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      playSlide();
                      setFilter(f);
                    }}
                    className={`text-[10px] px-3.5 py-1 rounded-full border transition-all ${
                      filter === f
                        ? 'bg-black border-black text-white font-semibold shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Fonts Row & Date Stamp Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-mono font-medium tracking-widest uppercase">Font Style</span>
              <div className="flex items-center gap-2.5 w-full justify-end">
                {/* Font list buttons */}
                <div className="flex items-center gap-1.5">
                  {FONTS.map((fo) => (
                    <button
                      key={fo}
                      onClick={() => {
                        playSlide();
                        setFont(fo);
                      }}
                      className={`text-[10px] px-3.5 py-1 rounded-full border transition-all ${
                        font === fo
                          ? 'bg-black border-black text-white font-semibold shadow-sm'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                      }`}
                    >
                      {fo}
                    </button>
                  ))}
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-4 bg-stone-200 mx-1" />

                {/* Calendar Button */}
                <button
                  onClick={() => {
                    playSlide();
                    setShowDate(!showDate);
                  }}
                  className={`p-1.5 border rounded-full transition-all hover:scale-105 active:scale-95 ${
                    showDate 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100'
                  }`}
                  title="Toggle Date stamp"
                >
                  <Calendar size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions Menu (Restart link & Share button) */}
        {image && (
          <div className="flex items-center gap-8 mt-2">
            {/* Restart Arrow */}
            <button
              onClick={handleRestart}
              className="text-[#a0aec0] hover:text-stone-600 font-medium text-sm flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} className="stroke-[2.5]" />
              <span>Restart</span>
            </button>

            {/* Share Button */}
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

      {/* SHARE MODAL POPUP */}
      {showShareModal && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-[3px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl relative border border-stone-100/50 animate-scaleUp">
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

            {/* Card Preview mockup inside modal */}
            <div className="w-[170px] p-3 pb-8 bg-[#faf9f6] border border-stone-200/40 rounded-sm shadow-md mx-auto mb-6 scale-[0.95] flex flex-col items-center">
              <div className="w-[146px] h-[146px] bg-[#f5f2eb] border border-stone-200/20 overflow-hidden flex items-center justify-center">
                {image && (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="w-full text-stone-800 text-[10px] text-center font-mono mt-2 overflow-hidden truncate">
                {caption || 'Snapshot'}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Copy Link */}
              <div
                onClick={handleCopyLink}
                className="rounded-2xl border border-stone-100 p-4 bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/10 flex items-center justify-center text-stone-600">
                  <LinkIcon size={16} />
                </div>
                <span className="text-[10px] text-stone-500 font-semibold mt-2.5">{copyStatus}</span>
              </div>

              {/* Download */}
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

            {/* Social Share Sheet (iOS Style) */}
            <div className="flex justify-between items-center px-1 border-t border-stone-100 pt-5">
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white font-semibold">
                  📸
                </div>
                <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600">Instagram</span>
              </button>

              <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-xl bg-[#0077b5] flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white text-xs font-mono font-bold">
                  in
                </div>
                <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600">LinkedIn</span>
              </button>

              <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-xl bg-[#0084ff] flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white">
                  ✉️
                </div>
                <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600">Mail</span>
              </button>

              <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white font-bold font-mono text-sm">
                  X
                </div>
                <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600">X</span>
              </button>

              <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 group">
                <div className="w-10 h-10 rounded-xl bg-[#4cd964] flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all text-white text-base">
                  💬
                </div>
                <span className="text-[8px] font-semibold text-stone-400 group-hover:text-stone-600">Messages</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPECS OVERLAY MODAL */}
      {showSpecsModal && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-[3px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-8 max-w-xl w-full shadow-2xl relative border border-stone-100/50 animate-scaleUp">
            <button
              onClick={() => {
                playSlide();
                setShowSpecsModal(false);
              }}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-50 transition-all z-20"
            >
              <X size={16} />
            </button>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-stone-850 flex items-center gap-1.5">
                  <span>Polaroid Studio</span>
                  <span className="text-stone-300 font-normal">•</span>
                  <span className="text-stone-400 font-normal">2025</span>
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">A digital way to customize your own polaroid.</p>
              </div>

              <a
                href="https://github.com/vidhyawalke/Poloroid-studio"
                target="_blank"
                rel="noreferrer"
                className="bg-[#0070f3] hover:bg-[#0062d2] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition-all"
              >
                <span>View on X</span>
                <ExternalLink size={10} />
              </a>
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
              
              {/* Mini Mockup Card */}
              <div className="w-[120px] p-2 pb-5 bg-white border border-stone-200/35 rounded-sm shadow-md flex flex-col items-center mb-3">
                <div className="w-[104px] h-[104px] bg-[#dce6f0] border border-stone-100" />
                <div className="w-12 h-1.5 bg-stone-200 mt-2 rounded-full" />
              </div>

              {/* Mockup Preset dots */}
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm border border-stone-200/10">
                {DOT_COLORS.slice(0, 7).map((c) => (
                  <div
                    key={c.name}
                    style={{ backgroundColor: c.hex }}
                    className="w-2.5 h-2.5 rounded-full border border-stone-100/50"
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
