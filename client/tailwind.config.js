/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Storefront palette: projection-screen white, masking black, projector-lamp amber
        screen: "#FFFFFF",
        paper: "#F3F4F1",
        masking: "#131417",
        lamp: "#F2A61F",
        "lamp-deep": "#8A5A00",
        deal: "#0F7B3F",
        sale: "#C23A2B",
        text: "#1B1D21",
        muted: "#5E636B",
        line: "#E2E4E7",
        // Admin panel palette
        ink: "#131417",
        charcoal: "#1B1D21",
        graphite: "#2A2D33",
        ivory: "#F3F4F1",
        champagne: "#F2A61F",
        gold: "#C98A12",
        mist: "#E2E4E7"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(19, 20, 23, 0.05), 0 8px 24px -16px rgba(19, 20, 23, 0.25)",
        luxe: "0 24px 64px -24px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};
