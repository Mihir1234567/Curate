/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#30e8ba",
        "background-light": "#f6f8f7",
        "background-dark": "#11211d",
        "neutral-dark": "#1a2e29",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Noto Serif", "serif"],
      },
    },
  },
  plugins: [],
};
