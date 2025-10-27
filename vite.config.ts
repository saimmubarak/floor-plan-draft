import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  optimizeDeps: {
    force: true,
    include: ["react-konva", "konva"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Ensure single instance and correct resolution of react-konva
      "react-konva": path.resolve(__dirname, "./node_modules/react-konva"),
      konva: path.resolve(__dirname, "./node_modules/konva"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
