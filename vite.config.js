import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})


// clour palette

// 'primary': "#009e92",
// 'secondary': "#66C9C1",
// 'blueshade': '#dcf2f6'
