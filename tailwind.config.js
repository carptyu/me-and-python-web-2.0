/** @type {import('tailwindcss').Config} */
// 原本用 cdn.tailwindcss.com 在瀏覽器即時編譯，改成建置時編譯（設定沿用原 index.html 內的 tailwind.config）。
export default {
  content: ['./index.html', './index.tsx', './App.tsx', './components/**/*.tsx', './*.ts'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', '"Inter"', 'sans-serif'],
      },
      colors: {
        concrete: {
          50: '#fafafa',
          100: '#f4f4f5', // Main BG
          200: '#e4e4e7', // Borders
          300: '#d4d4d8',
          400: '#a1a1aa', // Subtext
          // 500–700 原本沒定義，程式裡用到的 text-concrete-500/600/700 都失效變成黑字；補上 zinc 對應色
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a', // Dark Concrete
          900: '#18181b', // Text
        },
        urban: {
          green: '#4a5d4e', // Moss Green
          lightGreen: '#6b8270',
          accent: '#d97706',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
