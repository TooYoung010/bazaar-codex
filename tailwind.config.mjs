/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Bazaar tier colors
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        diamond: '#B9F2FF',
        legendary: '#FF6B35',
        // Hero brand colors
        vanessa: '#7BB7E0',
        dooley: '#A8E0A8',
        pygmalien: '#E0B87B',
        mak: '#D67BE0',
        jules: '#E07B7B',
        stelle: '#7BE0D6',
        common: '#A0A0A8'
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
