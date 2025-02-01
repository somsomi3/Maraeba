import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // 현재 모드(dev, production)에 맞는 환경 변수 로드
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
          enabled: true,
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
          globPatterns: ["**/*.{js,css,html,png,svg,ico,json}"],
          runtimeCaching: [
            {
              urlPattern: new RegExp(`^(${env.VITE_SPRING_API_URL}|${env.VITE_FLASK_API_URL})/`), // ✅ 올바른 환경 변수 적용
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
          ],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB로 설정
        },
      }),
    ],
  };
});