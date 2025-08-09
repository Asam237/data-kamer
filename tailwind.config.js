/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
        },
      },
      colors: {
        primary: {
          DEFAULT: "#006DB2",
        },
        primaryTitle: {
          DEFAULT: "#0E3758",
        },
        primaryDescription: {
          DEFAULT: "#1E75BA",
        },
        gray: {
          DEFAULT: "#F2F8FD",
        },
        secondary: {
          DEFAULT: "#FFC641",
        },
        orange: {
          DEFAULT: "#faaf42",
        },
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".container": {
          marginLeft: "auto",
          maxWidth: "80%",
          marginRight: "auto",
        },
      });
    },
  ],
};
