import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

const DOMAIN_NAME = process.env.DOMAIN_NAME || "localhost";

function inlineCSS() {
    return {
        name: "inline-css",
        enforce: "pre", // Ensure this runs before Vite's default CSS handling
        transform(code, id) {
            if (id.endsWith(".css")) {
                const cssContent = fs.readFileSync(id, "utf-8");
                const encodedCSS = Buffer.from(cssContent).toString("base64");
                const jsCode = `
          const style = document.createElement('style');
          const decodedCSS = atob('${encodedCSS}');
          style.innerHTML = decodedCSS;
          document.head.appendChild(style);
          export default style;
        `;
                return {
                    code: jsCode,
                    map: null,
                };
            }
        },
    };
}

// vite.config.js
export default defineConfig({
    build: {
        sourcemap: false,
        cssCodeSplit: false,
        assetsInlineLimit: 10000000, // Inline all assets to prevent separate files
        copyPublicDir: false,
        rollupOptions: {
            output: {
                entryFileNames: "bundle.js",
                manualChunks: () => "bundle", // Force all chunks into one
            },
        },
    },
    optimizeDeps: {
        exclude: ["**/*.css"], // Attempt to exclude CSS from optimization
    },
    plugins: [react(), inlineCSS()],
    server: {
        allowedHosts: [DOMAIN_NAME],
    },
});
