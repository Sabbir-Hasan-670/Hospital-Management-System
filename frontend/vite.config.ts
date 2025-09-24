import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/patients": "http://localhost:3000",
      "/encounters": "http://localhost:3000",
      "/charges": "http://localhost:3000",
      "/billing": "http://localhost:3000",
      "/nphies": "http://localhost:3000",
    },
  },
});
