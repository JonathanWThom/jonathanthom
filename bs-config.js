module.exports = {
  server: {
    baseDir: './',
    middleware: [
      function (req, res, next) {
        if (req.url.startsWith('/photos')) {
          const path = req.url.split('?')[0].replace(/\/$/, '');
          if (path === '/photos' || path.match(/^\/photos\/[^./]+$/)) {
            req.url = '/photos/index.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
          }
        }
        if (req.url === '/favicon.ico') {
          req.url = '/images/favicon-32.png';
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
