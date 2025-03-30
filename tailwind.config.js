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
        // Exact Rice Purity Test colors
        background: "#ffffff",
        text: "#000000",
        checkbox: "#000000",
        button: "#000000",
        buttonText: "#ffffff",
      },
      fontFamily: {
        // Matching Rice Purity Test font
        sans: ["Arial", "sans-serif"],
      },
      fontSize: {
        // Exact sizes from Rice Purity Test
        heading: "24px",
        subheading: "18px",
        body: "16px",
        button: "16px",
      },
      spacing: {
        // Matching Rice Purity Test spacing
        questionGap: "12px",
        sectionGap: "24px",
        pageMargin: "16px",
      },
    },
  },
  plugins: [],
};
