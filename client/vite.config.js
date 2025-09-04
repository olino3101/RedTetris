import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DOMAIN_NAME = process.env.DOMAIN_NAME || "localhost";

// vite.config.js
export default defineConfig({
    plugins: [
        react(),
        {
            name: "force-inline-everything",
            generateBundle(_, bundle) {
                // Inline all CSS into bundle.js
                const cssFiles = Object.keys(bundle).filter(
                    (key) =>
                        bundle[key].type === "asset" && key.endsWith(".css")
                );
                if (cssFiles.length > 0) {
                    const css = cssFiles
                        .map((key) => bundle[key].source)
                        .join("\n");
                    this.emitFile({
                        type: "asset",
                        fileName: "bundle.js",
                        source: `const style = document.createElement('style'); style.textContent = \`${css}\`; document.head.appendChild(style);`,
                    });
                    cssFiles.forEach((key) => delete bundle[key]);
                }
                // Delete all other asset files (fonts, images, etc.)
                const allAssets = Object.keys(bundle).filter(
                    (key) =>
                        bundle[key].type === "asset" && !key.endsWith(".js")
                );
                allAssets.forEach((key) => delete bundle[key]);
            },
        },
    ],
    build: {
        outDir: "dist",
        emptyOutDir: true,
        cssCodeSplit: false,
        assetsInlineLimit: 10000000, // Inline all assets as base64
        rollupOptions: {
            output: {
                entryFileNames: "bundle.js",
                assetFileNames: () => "bundle.js", // Force all assets to use the same name
                manualChunks: undefined, // Disable code splitting
                inlineDynamicImports: true, // Inline dynamic imports
            },
        },
    },
});
