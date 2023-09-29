const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      'xs': "420px",
      ...defaultTheme.screens
    },
    fontFamily: {
      display: "Poppins",
      logo: "Silkscreen",
      chunk: "ChunkFive",
      opti: "Opti",
      akenaten: "Akenaten",
      devant: "Devant",
    },
    extend: {
      colors: {
        blank: {
          DEFAULT: "#F1F5F9",
        },
        typography: {
          light: "#A3A3A3",
          DEFAULT: "#323232",
          dark: "#222222",
        },
        primary: {
          superlight: "#F0ABFC",
          light: "#D946EF",
          DEFAULT: "#A21CAF",
          dark: "#701A75",
        },
      },
    },
  },
};
