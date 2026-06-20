import React, { useState, useEffect, useRef } from 'react';
import BoardCanvas from './components/BoardCanvas';
import ControlPanel from './components/ControlPanel';
import { useSound } from './hooks/useSound';
import { 
  Info, 
  HelpCircle, 
  X, 
  Github, 
  Check, 
  Copy, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Pre-configured aesthetic default images from Unsplash
const DEFAULT_POLAROIDS = [
  {
    id: 'p1',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=500&auto=format&fit=crop',
    caption: 'Cozy mornings ☕️',
    date: '06.21.26',
    font: 'Reenie',
    filter: 'Warm Retro',
    rotation: -6,
    x: 80,
    y: 60,
    scale: 1,
    zoom: 1,
    panX: 0,
    panY: 0,
    showDate: true,
    isDeveloping: false,
    hasTape: true
  },
  {
    id: 'p2',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop',
    caption: 'Golden hours 🌅',
    date: '06.20.26',
    font: 'Caveat',
    filter: 'Vintage',
    rotation: 8,
    x: 380,
    y: 120,
    scale: 1,
    zoom: 1.1,
    panX: -10,
    panY: -15,
    showDate: true,
    isDeveloping: false,
    hasTape: false
  }
];

const DEFAULT_STICKERS = [
  { id: 's1', type: 'tape-pink', x: 160, y: 35, rotation: -4 },
  { id: 's2', type: 'doodle-sparkle', x: 330, y: 110, rotation: 15 },
  { id: 's3', type: 'pin-red', x: 490, y: 110, rotation: 0 },
];

export default function App() {
  const { playShutter, playSlide, playTape } = useSound();
  
  const [polaroids, setPolaroids] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [background, setBackground] = useState('bg-cork');
  const [boardTitle, setBoardTitle] = useState('My PolaPin Canvas');
  const [selectedId, setSelectedId] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiWarning, setApiWarning] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const canvasRef = useRef(null);

  // Formatting date standard (MM.DD.YY)
  const getFormattedDate = () => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}.${dd}.${yy}`;
  };

  // Load Board Layout (via URL search query or LocalStorage)
  useEffect(() => {
    const initLoad = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedBoardId = urlParams.get('b');

      if (sharedBoardId) {
        try {
          const res = await fetch(`/api/boards/${sharedBoardId}`);
          if (res.ok) {
            const data = await res.json();
            setPolaroids(data.polaroids || []);
            setStickers(data.stickers || []);
            setBackground(data.background || 'bg-cork');
            setBoardTitle(data.title || 'Shared Board');
            setIsLoading(false);
            return;
          } else {
            console.error('Failed to load shared board, loading local copy');
            setApiWarning('Could not load the shared board. Loading your offline canvas instead.');
          }
        } catch (err) {
          console.error('API connection failed, falling back to local storage', err);
          setApiWarning('Server offline. Showing your offline canvas.');
        }
      }

      // Local storage fallback
      const cachedData = localStorage.getItem('polapin_board_cache');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setPolaroids(parsed.polaroids || []);
          setStickers(parsed.stickers || []);
          setBackground(parsed.background || 'bg-cork');
          setBoardTitle(parsed.title || 'My PolaPin Canvas');
        } catch (e) {
          console.error(e);
        }
      } else {
        // Load default welcome layout
        setPolaroids(DEFAULT_POLAROIDS);
        setStickers(DEFAULT_STICKERS);
      }
      setIsLoading(false);
    };

    initLoad();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoading) {
      const stateToCache = { polaroids, stickers, background, title: boardTitle };
      localStorage.setItem('polapin_board_cache', JSON.stringify(stateToCache));
    }
  }, [polaroids, stickers, background, boardTitle, isLoading]);

  // Polaroid Add/Update/Delete Handlers
  const handleAddPolaroid = ({ imageUrl, x, y, caption }) => {
    playShutter();
    const newCard = {
      id: Math.random().toString(36).substring(2, 9),
      imageUrl,
      caption: caption || '',
      date: getFormattedDate(),
      font: 'Reenie',
      filter: 'Normal',
      rotation: Math.floor(Math.random() * 20) - 10,
      x: x || 100,
      y: y || 100,
      scale: 1,
      zoom: 1,
      panX: 0,
      panY: 0,
      showDate: true,
      isDeveloping: true,
      hasTape: false
    };
    setPolaroids((prev) => [...prev, newCard]);
    setSelectedId(newCard.id);
  };

  const handleUpdatePolaroid = (id, fields) => {
    setPolaroids((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...fields } : card))
    );
  };

  const handleDeletePolaroid = (id) => {
    playSlide();
    setPolaroids((prev) => prev.filter((card) => card.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Sticker Add/Update/Delete Handlers
  const handleAddSticker = ({ type, x, y, rotation }) => {
    const newSticker = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      x: x || 150,
      y: y || 150,
      rotation: rotation || 0,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedId(newSticker.id);
  };

  const handleUpdateSticker = (id, fields) => {
    setStickers((prev) =>
      prev.map((st) => (st.id === id ? { ...st, ...fields } : st))
    );
  };

  const handleDeleteSticker = (id) => {
    setStickers((prev) => prev.filter((st) => st.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Reset entire Canvas
  const handleResetBoard = () => {
    setPolaroids([]);
    setStickers([]);
    setBackground('bg-cork');
    setBoardTitle('My PolaPin Canvas');
    setSelectedId(null);
    setShareUrl(null);
  };

  // Connect to backend API to save the current collage board layout
  const handleSaveBoard = async () => {
    setIsSaving(true);
    setShareUrl(null);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: boardTitle,
          background,
          polaroids,
          stickers
        })
      });

      if (res.ok) {
        const data = await res.json();
        const savedId = data.id;
        const link = `${window.location.origin}?b=${savedId}`;
        setShareUrl(link);
        
        // Show celebratory success
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
      } else {
        alert('Failed to save the board layout.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to backend API.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      playTape();
      // Temporarily change button to indicate successful copy
      const copyBtn = document.getElementById('copy-indicator');
      if (copyBtn) {
        copyBtn.innerText = 'Copied!';
        setTimeout(() => {
          if (copyBtn) copyBtn.innerText = 'Copy Link';
        }, 2000);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen p-4 select-none relative overflow-hidden bg-zinc-950 font-sans">
      
      {/* Header bar */}
      <header className="flex justify-between items-center w-full px-2 py-2 mb-2 z-30">
        {/* Left: Back Arrow */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm('Return to home page?')) window.location.href = 'https://liumichelle.com';
            }}
            className="flex items-center justify-center p-2 bg-zinc-900/50 border border-zinc-800/40 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-md group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          {/* Editable Board Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 border-b border-indigo-400">
              <input
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                autoFocus
                maxLength={25}
                className="bg-transparent outline-none font-bold text-lg text-zinc-100 py-0.5"
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
              />
              <button onClick={() => setIsEditingTitle(false)} className="text-indigo-400">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 group cursor-pointer hover:bg-zinc-900/40 py-1 px-2 rounded-lg transition-colors"
            >
              <h1 className="font-bold text-lg text-zinc-100 tracking-wide">{boardTitle}</h1>
              <Edit3 size={12} className="text-zinc-500 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Center Warning Info (API Fallbacks) */}
        {apiWarning && (
          <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 py-1 px-3.5 rounded-full text-xs">
            <AlertCircle size={14} />
            <span>{apiWarning}</span>
            <button onClick={() => setApiWarning(null)} className="ml-1 text-amber-500 hover:text-amber-300">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Right: Project Info Modal trigger */}
        <button
          onClick={() => {
            playSlide();
            setShowInfoModal(true);
          }}
          className="flex items-center gap-1.5 py-1.5 px-4 bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full text-xs font-semibold shadow-md transition-all active:scale-95"
        >
          <Info size={14} /> Project Info
        </button>
      </header>

      {/* Main Draggable Board Canvas */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-sm font-mono text-zinc-500 tracking-widest">Loading Canvas...</span>
        </div>
      ) : (
        <BoardCanvas
          polaroids={polaroids}
          stickers={stickers}
          background={background}
          onUpdatePolaroid={handleUpdatePolaroid}
          onDeletePolaroid={handleDeletePolaroid}
          onAddPolaroid={handleAddPolaroid}
          onUpdateSticker={handleUpdateSticker}
          onDeleteSticker={handleDeleteSticker}
          selectedId={selectedId}
          onSelectId={setSelectedId}
          canvasRef={canvasRef}
        />
      )}

      {/* Dashboard Control Bar at the bottom */}
      {!isLoading && (
        <ControlPanel
          background={background}
          onChangeBackground={setBackground}
          onAddSticker={handleAddSticker}
          onAddPolaroid={handleAddPolaroid}
          onResetBoard={handleResetBoard}
          onSaveBoard={handleSaveBoard}
          isSaving={isSaving}
          canvasRef={canvasRef}
        />
      )}

      {/* 3. SHARE LINK MODAL POPUP */}
      {shareUrl && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-dark border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-zinc-200">Board Saved Successfully!</h3>
              <button 
                onClick={() => setShareUrl(null)}
                className="p-1 rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Your custom mood board is saved online. Share this link with friends so they can view your vintage polaroid board!
            </p>
            <div className="flex gap-2 items-center bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent outline-none text-zinc-200 text-xs font-mono select-all"
              />
              <button
                id="copy-indicator"
                onClick={handleCopyLink}
                className="flex-shrink-0 flex items-center gap-1 py-1.5 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-bold transition-all active:scale-95"
              >
                <Copy size={12} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DETAILS INFO OVERLAY MODAL */}
      {showInfoModal && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-dark border border-zinc-800/80 w-full max-w-lg rounded-2xl p-7 shadow-2xl animate-scaleUp text-left max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide uppercase">PolaPin Studio Specs</h2>
                <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-0.5">Mimic & Premium Add-on Log</p>
              </div>
              <button
                onClick={() => {
                  playSlide();
                  setShowInfoModal(false);
                }}
                className="p-1.5 rounded-full text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <div>
                <h4 className="font-semibold text-zinc-100 flex items-center gap-1 text-xs uppercase tracking-wider text-indigo-400">
                  ⚡️ Original Site Features Mimicked
                </h4>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-400 text-xs">
                  <li>Vintage Polaroid borders with authentic aspect ratios.</li>
                  <li>Real-time custom handwritten font toggle captions.</li>
                  <li>Auto-formatted physical timestamp date display (`MM.DD.YY`).</li>
                  <li>Interactive colors updates (enhanced into draggable gradients & corkboard).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-100 flex items-center gap-1 text-xs uppercase tracking-wider text-rose-400">
                  ✨ Premium Add-on Upgrades
                </h4>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 text-zinc-400 text-xs">
                  <li><strong>Infinite Mood Board Canvas</strong>: Generate, overlap, and stack multiple cards instead of a single static element.</li>
                  <li><strong>Developing Film Animation</strong>: 3-second blur & de-noise transitions when image loads.</li>
                  <li><strong>Tactile Web Audio Engine</strong>: Shutter clicks, tape tearing, and cards sliding synthesized programmatically in-browser.</li>
                  <li><strong>Stickers & Washi Tapes</strong>: Drag translucent tape strips, pushpins, and emoji sketches to overlay on cards.</li>
                  <li><strong>High-Fidelity Filters & Pan Crop</strong>: 6 vintage photo filters & mouse dragging to pan/crop inside the frames.</li>
                </ul>
              </div>

              <div className="border-t border-zinc-800/80 pt-4 mt-2">
                <h4 className="font-semibold text-zinc-100 text-xs uppercase tracking-wider text-amber-400">
                  🛠️ Developer Tech Stack
                </h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-mono">
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/30">
                    <span className="text-zinc-500 block">Frontend</span>
                    Vite, React 18, Tailwind CSS
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/30">
                    <span className="text-zinc-500 block">Backend API</span>
                    Node.js, Express, MongoDB Atlas
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/30">
                    <span className="text-zinc-500 block">Animations</span>
                    Framer Motion, CSS Grain
                  </div>
                  <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/30">
                    <span className="text-zinc-500 block">Deployment</span>
                    Vercel (Serverless Functions)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-800/80 pt-5 mt-5">
              <span className="text-[10px] text-zinc-500 font-mono">Designed & Built for Vercel</span>
              <a 
                href="https://github.com/vidhyawalke/Poloroid-studio" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Github size={14} /> Repository
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
