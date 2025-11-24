/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(135deg, #22d3ee, #3b82f6, #8b5cf6)",
        "custom-gradient-hero": "linear-gradient(to right, #c2e59c, #64b3f4)",
        "dark-gradient": "linear-gradient(to right, #2c3e50, #4ca1af)",
        "danger-gradient":
          "linear-gradient(to right, #ef4444, #dc2626, #b91c1c)",
      },
      boxShadow: {
        "custom-indigo":
          "2px 4px 6px -1px rgba(99, 102, 241, 0.5), 2px 2px 4px -1px rgba(99, 102, 241, 0.3)",
        "custom-pink":
          "2px 4px 6px -1px rgba(34, 211, 238, 0.45), 2px 2px 4px -1px rgba(59, 130, 246, 0.35)",
        "custom-red":
          "2px 4px 6px -1px rgba(239, 68, 68, 0.5), 2px 2px 4px -1px rgba(220, 38, 38, 0.35)",
      },
      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        background: "var(--bg-color)",
        "font-primary": "var(--font-primary)",
        "font-secondary": "var(--font-secondary)",

        "button-bg": "var(--button-bg)",
        "border-primary": "var(--border-primary)",

        "buttonbg-hover": "var(--bg-button-hover)",
        // for text
        "primary-text-color": "var(--primary-text-color)",
        "secondary-text-color": "var(--secondary-text-color)",
        "primary-accent-color": "var(--primary-accent-color)",
        "link-hover": "var(--link-hover)",
        "link-color": "var(--link-color)",
        //for bg
        "primary-bg-color": "var(--primary-bg-color)",
        "secondary-bg-color": "var(--secondary-bg-color)",
        "unit-bg-color": "var(--unit-bg-color)",
        //for border
        "input-border-stationary": "var(--input-border-stationary)",
        "input-border-primary": "var(--input-border-primary)",
      },
    },
  },
  plugins: [],
};
