import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE");

  return {
    base: "/",
    define: {
      VITE_SPRING_API_URL: JSON.stringify(env.VITE_SPRING_API_URL),
      VITE_FLASK_API_URL: JSON.stringify(env.VITE_FLASK_API_URL),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: false,
        },
        manifest: {
          name: "My PWA App",
          short_name: "PWA App",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#000000",
          icons: [
            {
              src: "/192image.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/512image.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true, // ✅ 오래된 캐시 자동 삭제
          globPatterns: [
            "**/*.{js,css,html,png,svg,ico,json}", // ✅ public & dist 내부 파일만 포함
            "public/**/*.{png,svg,jpg,jpeg,gif,css}", // ✅ public 폴더 내 파일 포함
          ],
          runtimeCaching: [
            {
              urlPattern: new RegExp(`^(${env.VITE_SPRING_API_URL}|${env.VITE_FLASK_API_URL})/`), // ✅ API 요청 캐싱 (NetworkFirst)
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 50, // ✅ 캐시 항목 수 제한 (100 → 50)
                  maxAgeSeconds: 60 * 60 * 24 * 7, // ✅ 7일 유지
                },
              },
            },
          ],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // ✅ 5MB 제한
        },
      }),
    ],
    server: {
      host: "0.0.0.0",
    },
  };
});
