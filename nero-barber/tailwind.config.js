/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta Premium - Nero Barber
        premium: {
          black: "#121212", // Preto profundo
          dark: "#1E1E1E", // Cinza muito escuro
          gold: "#D4AF37", // Dourado clássico
          goldLight: "#F3E5AB", // Dourado claro
          white: "#F5F5F5", // Branco off-white
          gray: "#A0A0A0", // Cinza para textos
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Lato"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
