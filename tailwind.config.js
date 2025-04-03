/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rice Purity Test colors
        background: "#F4F4F4",
        primary: "#640000",
        secondary: "#8B0000",
        text: "#000000",
        checkbox: "#000000",
        button: "#640000",
        buttonText: "#ffffff",
      },
      fontFamily: {
        // Matching Rice Purity Test font
        sans: ["Arial", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      fontSize: {
        // Rice Purity Test font sizes
        heading: "2rem",
        subheading: "1.2rem",
        body: "1rem",
        button: "1.125rem",
      },
      spacing: {
        // Rice Purity Test spacing
        questionGap: "0.5rem",
        sectionGap: "2rem",
        pageMargin: "1rem",
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shine: "shine 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
