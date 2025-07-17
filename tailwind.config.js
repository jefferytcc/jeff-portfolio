/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(210, 100%, 56%)",
          light: "hsl(210, 100%, 70%)",
          dark: "hsl(210, 100%, 40%)",
        },
        cloud: {
          DEFAULT: "hsl(214, 18%, %)",
          light: "hsl(210, 100%, 70%)",
          dark: "hsl(210, 100%, 40%)",
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
