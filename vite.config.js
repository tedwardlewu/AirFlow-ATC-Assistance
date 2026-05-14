import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        open: "/Index.html"
    },
    build: {
        rollupOptions: {
            input: {
                Index: resolve(__dirname, "Index.html")
            }
        }
    }
});