import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

function offlineShell(): Plugin {
  let outDir: string;
  return {
    name: "kyty-offline-shell",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const assets = await readdir(resolve(outDir, "assets"));
      const precache = [
        "/index.html",
        "/favicon.svg",
        "/images/project-icon.svg",
        "/images/kitty-running-v2.gif",
        "/images/kitty-still-v2.png",
        ...assets
          .filter((name) => /\.(?:js|css|woff2?)$/.test(name))
          .map((name) => `/assets/${name}`),
      ];
      const worker = await readFile(resolve(outDir, "sw.js"), "utf8");
      const html = await readFile(resolve(outDir, "index.html"), "utf8");
      const loaderAssets = await Promise.all([
        readFile(resolve(outDir, "images/kitty-running-v2.gif")),
        readFile(resolve(outDir, "images/kitty-still-v2.png")),
        readFile(resolve(outDir, "images/project-icon.svg")),
        readFile(resolve(outDir, "favicon.svg")),
      ]);
      const version = createHash("sha256")
        .update(worker + html + precache.join("\n"))
        .update(Buffer.concat(loaderAssets))
        .digest("hex")
        .slice(0, 12);
      await writeFile(
        resolve(outDir, "sw.js"),
        `self.__KYTY_CACHE_CONFIG__ = ${JSON.stringify({ version, precache })};\n${worker}`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineShell()],
  server: { host: "127.0.0.1", port: 5173 },
});
