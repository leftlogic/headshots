"use strict";

var games = require('./game');

module.exports = function (app) {
  app.get('/', function (req, res) {
    if (!req.session) {
      req.session = {};
    }

    // req.session.pin = games.getPin(req.session);
    console.log(req.session);

    res.render('welcome');
  });

  app.get('/test', function (req, res) {
    res.render('player-a');
  });

  app.get('/-status/:pin', function (req, res, next) {
     if (req.xhr) {
       console.log('xhr status');
       if (req.param.pin) {
         var game = games.get(req.param.pin);
         if (game.state === 'ready' || game.state === 'playing') {
           res.send(true);
         } else if (game.state === 'waiting') {
           console.log('waiting for game to start');
           game.on('start-game', function () {
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

    if (games.join(req.session, req.body.pin)) {
      console.log('joining');
      res.render('player-a');
    } else {
      console.log('failed joining');
      res.render('join');
    }
  });

  app.get('/start', function (req, res) {
    var pin = req.session.pin;
    if (!req.session.pin) {
      pin = req.session.pin = games.getPin(req.session);
    }

    games.join(req.session, pin);

    res.render('start', {
      pin: req.session.pin
    });
  });
};