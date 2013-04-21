"use strict";

var games = require('./game');

module.exports = function (app) {
  console.log('configure');
  app.get('/', function (req, res) {
    if (!req.session) {
      req.session = {};
    }

    req.session.pin = games.getPin(req.session);
    console.log(req.session);

    res.render('welcome');
  });

  app.get('/status/:pin', function (req, res, next) {
     if (req.xhr) {
       if (req.param.pin) {
         var game = games.get(req.param.pin);
         if (game.state === 'ready') {
           res.send(true);
         } else if (game.state === 'waiting') {
           game.on('playing', function () {
             console.log('playing state');
             res.send({
               ready: true,
               mygo: game.isCurrentPlayer(req.session.player)
             });
           });
         }
       }
     } else {
       next();
     }
  });

  app.get('/join', function (req, res) {
    res.render('join');
  });

  app.post('/join', function (req, res) {
    // TODO test if there's an active game under that pin,
    // if so, allow join and remove from cache

    if (games.join(req.body.pin, req)) {
      res.render('player-b');
    } else {
      res.render('join');
    }
  });

  app.get('/start', function (req, res) {
    if (!req.session.pin) {
      req.session.pin = games.getPin(req.session);
    }

    res.render('start', {
      pin: req.session.pin
    });
  });
};