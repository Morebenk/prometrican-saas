/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'; // Import typography plugin
import daisyui from 'daisyui'; // Import daisyui plugin

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    typography, // Use the imported typography plugin
    daisyui, // Use the imported daisyui plugin
  ],
  daisyui: {
    themes: [
      {
        default: {
          "primary": "#180042",
          "primary-content": "#fefbf6",
          "secondary": "#c7b9f8",
          "neutral": "#180042",
          "neutral-content": "#fefbf6",
          "accent": "#db2777",
          "accent-content": "#180042",
          "base-content": "#180042",
          "base-100": "#fefbf6",
          "base-200": "#faedd6",
          "success": "#37d399",
          "error": "#f77272",
        },
      },
      'dracula',
    ],
  },
};