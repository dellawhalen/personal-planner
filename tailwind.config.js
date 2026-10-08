/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F5F2',
        blush: '#E9B1C8',
        sage: '#A9B7A4',
        charcoal: '#28252A',
        berry: '#79525F',
        beige: '#E8D9C9',
        paper: '#FFFFFF',
      },
      fontFamily: {
        serif: ['Pixelify Sans', 'Trebuchet MS', 'sans-serif'],
        pixel: ['Pixelify Sans', 'Trebuchet MS', 'sans-serif'],
        dot: ['DotGothic16', 'Courier New', 'monospace'],
        sans: ['DM Sans', 'Arial', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        bloom: '0 18px 60px rgba(121, 82, 95, 0.12)',
      },
    },
  },
  plugins: [],
}
