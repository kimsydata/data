/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#16a34a", // 주색
          dark: "#065f46", // 보조
          50: "#f0fdf4",
          100: "#dcfce7",
          600: "#16a34a",
          700: "#15803d",
          800: "#065f46",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "'Segoe UI'",
          "'Apple SD Gothic Neo'",
          "'Malgun Gothic'",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
