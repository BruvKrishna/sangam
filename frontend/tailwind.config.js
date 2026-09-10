/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e293b',
          light: '#f8fafc',
        },
        accent: {
          DEFAULT: '#2563eb',
          warning: '#f59e0b',
          critical: '#ef4444',
          success: '#10b981',
        }
      }
    },
  },
  plugins: [],
}
