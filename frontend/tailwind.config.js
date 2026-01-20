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
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(250, 204, 21, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(250, 204, 21, 0.05) 0px, transparent 50%)',
      }
    },
  },
  plugins: [],
}
