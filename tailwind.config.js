/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: '#B58E67',
        secondary: '#4C6E81',
        'primary-shade': '#F9F0E6',
        'dark-shade': '#765C42',
        
        // Neutral Colors
        'light-color': '#FFFFFE',
        'black-color': '#0E0E0E',
        'heading-color': '#0F0106',
        background: '#FFFFFF',
        'background-alt': '#f6f6f6',
        foreground: '#4C4C4C',
        'meta-color': '#A6A3A3',
        'border-color': '#E7E6E6',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      spacing: {
        '20': '0.44rem',
        '30': '0.67rem',
        '40': '1rem',
        '50': '1.5rem',
        '60': '2.25rem',
        '70': '3.38rem',
        '80': '5.06rem',
      },
      borderRadius: {
        'btn': '0.375em',
      },
      maxWidth: {
        'container': '1260px',
        'content': '980px',
        'wide': '1960px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}