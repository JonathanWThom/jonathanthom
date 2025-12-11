import type { Options } from "browser-sync";

const config: Options = {
  server: {
    baseDir: "./",
    middleware: [
      function (req, res, next) {
        // Rewrite /photos to /photos/index.html
        if (req.url === "/photos" || req.url === "/photos/") {
          req.url = "/photos/index.html";
        }
        // Rewrite /favicon.ico to /images/favicon.ico
        if (req.url === "/favicon.ico") {
          req.url = "/images/favicon.ico";
        }
        next();
      },
    ],
  },
  files: ["*.html", "*.css", "*.js"],
  port: 3000,
  notify: false,
  open: false,
};

export default config;
