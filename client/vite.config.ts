import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // /api 요청을 백엔드(:4000)로 프록시 → 동일 출처가 되어 세션 쿠키가 그대로 동작
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
