/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', '"Inter"', 'sans-serif'],
        reenie: ['"Reenie Beanie"', 'cursive'],
        caveat: ['"Caveat"', 'cursive'],
        kalam: ['"Kalam"', 'cursive'],
        shadows: ['"Shadows Into Light"', 'cursive'],
      },
      animation: {
        'develop': 'developFilm 4s ease-out forwards',
        'subtle-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        developFilm: {
          '0%': { filter: 'brightness(0.05) contrast(1.8) saturate(0.1) blur(4px)' },
          '30%': { filter: 'brightness(0.2) contrast(1.5) saturate(0.3) blur(2px)' },
          '60%': { filter: 'brightness(0.6) contrast(1.2) saturate(0.7) blur(1px)' },
          '100%': { filter: 'brightness(1) contrast(1) saturate(1) blur(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'polaroid': '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'polaroid-hover': '0 20px 38px rgba(0, 0, 0, 0.18), 0 4px 14px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
      }
    },
  },
  plugins: [],
}
