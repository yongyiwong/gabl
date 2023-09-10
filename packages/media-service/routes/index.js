const { router: video } = require('./video');

module.exports = app => {
  app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  });

  app.use('/video', video);
};
