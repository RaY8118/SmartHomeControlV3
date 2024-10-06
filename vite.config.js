import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Smart Control',
        short_name: 'Smart Home Control',
        description: '',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'images/favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          },
          {
            src: 'images/domotics192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'images/domotics512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
