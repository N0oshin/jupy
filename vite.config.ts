import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix → load every key from .env, not just the VITE_-exposed ones. This
  // value is only used by the dev server below; it is never shipped to the client.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    server: {
      proxy: {
        /**
         * The order-confirmation email is sent by the companion server in
         * server/index.js, which runs as its own process on :4001.
         *
         * email.service.ts posts to a RELATIVE '/api/send-order-confirmation'.
         * In production that is same-origin and nginx proxies it to the
         * companion server. In dev the same relative URL resolves against the
         * Vite dev server, which has no such route — hence the 404.
         *
         * Proxying it here makes dev behave exactly like production, so the
         * frontend keeps one code path and nobody has to remember to comment a
         * localhost URL back out before deploying. It is also same-origin from
         * the browser's point of view, so the companion server's CORS allowlist
         * stops mattering (it only lists :5173, and Vite happily starts on
         * :5174 when that port is taken).
         */
        '/api/send-order-confirmation': {
          target: env.EMAIL_SERVER_URL || 'http://localhost:4001',
          changeOrigin: true,
        },
        // Same arrangement for the contact form (see contact.service.ts): it
        // posts to a relative /api/contact, which is same-origin in production
        // via nginx and needs proxying to the companion server in dev.
        '/api/contact': {
          target: env.EMAIL_SERVER_URL || 'http://localhost:4001',
          changeOrigin: true,
        },
      },
    },

    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) return 'gsap'
            if (id.includes('node_modules/framer-motion')) return 'motion'
            return undefined
          },
        },
      },
    },
  }
})
