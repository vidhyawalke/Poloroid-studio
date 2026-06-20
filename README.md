# 📸 PolaPin Studio

**PolaPin Studio** is a high-fidelity, interactive digital Polaroid collage board inspired by Michelle Liu's *Polaroid Studio*. Built using the MERN stack (React, Express, MongoDB) and tailormade for seamless Vercel deployment, it allows you to create, style, drag, pin, and share beautiful Pinterest-style Polaroid collages complete with realistic, real-time sound effects and retro image development filters.

---

## ✨ Features & Enhancements

- **Infinite Interactive Canvas**: Generate multiple polaroid cards, drag them around, stack them, or double-click to rotate.
- **Physical Film Developing**: Uploaded images start dark, blurry, and green, slowly gaining sharp contrast and color over 3 seconds.
- **Web Audio Sound Engine**: High-fidelity shutter clicks, tape ripping, and paper sliding sounds synthesized in-browser using the Web Audio API.
- **Sticker Drawer**: Decorate boards with translucent washi tapes, metallic pushpins, and hand-drawn doodles that pin to cards.
- **In-Frame Zoom & Pan Crop**: Drag your photo inside the polaroid to adjust alignment, then set custom retro filters (Vintage, Mono, Cool, Warm).
- **Interactive Handwriting Text**: Type captions directly on the Polaroids using vintage handwriting typography.
- **Export to PNG**: Instantly compile your canvas and download it as a high-resolution PNG using `html2canvas`.
- **Database Sharing**: Save your boards online to MongoDB Atlas and receive a custom shareable link.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (dragging & canvas math)
- **Backend API**: Node.js, Express (configured for Vercel Serverless Functions in `api/`)
- **Database**: MongoDB Atlas (via Mongoose schemas)
- **Sound**: Web Audio API (real-time programmatically synthesized sound effects)
- **Compilation**: html2canvas & Canvas Confetti

---

## 🚀 Local Development Setup

To run PolaPin Studio locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vidhyawalke/Poloroid-studio.git
   cd Poloroid-studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file at the root to enable persistent MongoDB saves:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   ```
   *Note: If no database is configured, the server will operate in high-performance **In-Memory fallback mode** and store local drafts in browser `localStorage`.*

4. **Start the local server and client concurrently**:
   ```bash
   npm run dev:all
   ```
   - Client will open at: `http://localhost:3000`
   - Express Server runs at: `http://localhost:5000`

---

## ☁️ Deploy to Vercel (MERN Stack Serverless)

This repository is optimized for Vercel out of the box using Serverless Express:

1. **Import the repository** into your Vercel Dashboard.
2. In the project settings, add the environment variable:
   - `MONGODB_URI`: *Your MongoDB connection string*
3. Click **Deploy**. Vercel will automatically build the static Vite frontend and configure the `api/index.js` file to run as serverless API routes on `/api/*` endpoints!

---

## 📜 License
This project is open-source and free to adapt. Enjoy pinning!
