/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medic: {
          purple: "#7c3aed",
          yellow: "#facc15",
          black: "#000000",
          white: "#ffffff",
        },
      },
    },
  },
  plugins: [],
}
