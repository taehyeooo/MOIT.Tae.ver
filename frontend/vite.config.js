import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // <<< 추가: 서버 프록시 설정
  server: {
    proxy: {
      // '/api'로 시작하는 모든 요청을 http://localhost:3000 으로 보냅니다.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})