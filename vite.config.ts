import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const LOVABLE_CLOUD_DEFAULTS = {
  VITE_SUPABASE_PROJECT_ID: "txhaizbihxlalznkplaa",
  VITE_SUPABASE_URL: "https://txhaizbihxlalznkplaa.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_SyaXSTCzvTH-dV_dHUrvAQ_55i7NML-",
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseEnv = {
    VITE_SUPABASE_PROJECT_ID:
      process.env.VITE_SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID || LOVABLE_CLOUD_DEFAULTS.VITE_SUPABASE_PROJECT_ID,
    VITE_SUPABASE_URL:
      process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || LOVABLE_CLOUD_DEFAULTS.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY:
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      LOVABLE_CLOUD_DEFAULTS.VITE_SUPABASE_PUBLISHABLE_KEY,
  };

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(supabaseEnv.VITE_SUPABASE_PROJECT_ID),
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseEnv.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseEnv.VITE_SUPABASE_PUBLISHABLE_KEY),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("date-fns")) return "vendor-date";
            if (id.includes("react-dom") || id.includes("scheduler")) return "vendor-react-dom";
            if (id.includes("/react/") || id.includes("react/jsx")) return "vendor-react";
          },
        },
      },
    },
  };
});
