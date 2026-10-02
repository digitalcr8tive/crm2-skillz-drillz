import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The custom domain serves the website at its root, including all route pages.
  base: '/',
  plugins: [react()],
})
