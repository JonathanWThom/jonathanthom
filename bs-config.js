module.exports = {
  server: {
    baseDir: './',
    middleware: [
      function (req, res, next) {
        if (req.url === '/photos' || req.url === '/photos/') {
          req.url = '/photos/index.html';
        }
        if (req.url === '/favicon.ico') {
          req.url = '/images/favicon.ico';
        }
        next();
      }
    ]
  },
  files: ['*.html', '*.css', '*.js'],
  port: 3000,
  notify: false,
  open: false
};
