"use strict";
module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('welcome');
  });

  app.get('/join', function (req, res) {
    res.render('join');
  });

  app.post('/join', function (req, res) {
    // TODO test if there's an active game under that pin,
    // if so, allow join and remove from cache
    res.render('join');
  });

  app.get('/start', function (req, res) {
    res.render('start', {
      pin: 1000 + (Math.random() * 8999 | 0)
    });
  });
};