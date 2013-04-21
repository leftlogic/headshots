"use strict";
module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('welcome');
  });

  app.get('/join', function () {

  });

  app.get('/start', function () {

  });
};