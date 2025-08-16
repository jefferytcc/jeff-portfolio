/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./works/**/*.{js,ts,jsx,tsx,html}",
    "./works/**/*.html",
    "./src/**/*.html",
    "./src/partials/**/*.html", // wherever your components are
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(240, 1%, 13%)",
          light: "hsl(210, 100%, 70%)",
          dark: "hsl(210, 100%, 40%)",
        },
        cloud: {
          DEFAULT: "hsl(210, 20%, 98%)",
          light: "hsl(207, 24%, 93%)",
          dark: "hsl(210, 100%, 40%)",
        },
        ink: {
          DEFAULT: "hsl(214, 18%, 38%)",
          light: "hsl(213, 18%, 48%)",
          dark: "hsl(215, 14%, 17%)",
        },
        success: "hsl(142, 70%, 45%)",
        danger: "hsl(0, 84%, 60%)",
        warning: "hsl(38, 92%, 50%)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Alata", "sans-serif"],
      },
    },
  },
  safelist: ["scale-100", "opacity-100"],
  plugins: [],
};
