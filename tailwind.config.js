/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(52, 211, 153, 0.2)',
      },
    },
  },
  plugins: [],
}
