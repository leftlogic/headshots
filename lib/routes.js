"use strict";

var games = require('./game');

module.exports = function (app) {
  app.get('/', function (req, res) {
    req.session.destroy();
    // req.session = null;

    // req.session.pin = games.getPin(req.session);

    res.render('welcome');
  });

  app.get('/test/:pin?', function (req, res, next) {
    var session = {};

    var pin = req.params.pin,
        game;

    if (pin) {
      game = games.get(pin);

      if (!game) {
        pin = games.getPin(session);
      }
    } else {
      pin = games.getPin(session);
      console.log('adding dummy join');
      games.join(session, pin); // dummy user
    }

    console.log('joining test game');

    var gamedata = games.join(req.session, pin);

    console.log('-------------------');
    console.log(gamedata);

    if (gamedata) {
      req.session.playerId = gamedata.playerId;
      req.session.ingame = pin;

      game = games.get(req.session.ingame);
      console.log('in game', req.session.ingame, game);
      if (game) {
        var turn = game.isCurrentPlayer(req.session.playerId);
        res.render('player-a', {
          pin: req.session.pin || 'null',
          player: {
            letter: req.session.playerId,
            turn: turn
          }
        });
        return;
      } else {
        return res.redirect('/');
      }
    }

    next();
  });

  app.get('/status/:pin', function (req, res, next) {
     if (req.xhr) {
       console.log('xhr status');
       if (req.params.pin) {
         var game = games.get(req.params.pin);
         console.log('xhr game', game);
         if (game.state === 'ready' || game.state === 'playing') {
           res.send(true);
         } else if (game.state === 'waiting') {
           console.log('waiting for game to start');

           // FIXME this event isn't being picked up at all
           game.on('start-game', function () {
             console.log('playing state');
             res.send(true);
           });
         }
       }
     } else {
       next();
     }
  });

  app.get('/join/:pin', function (req, res) {
    var pin = req.session.pin = req.params.pin;

    var game = games.get(pin);

    if (!game) {
      games.getPin({ pin: pin });
    }

    var gamedata = games.join(req.session, pin);

    req.session.playerId = gamedata.playerId;
    req.session.ingame = pin;

    res.render('start', {
      pin: req.session.pin
    });

  });

  app.get('/join', function (req, res) {
    if (req.session.ingame) {
      res.redirect('/play');
    } else {
      res.render('join');
    }
  });

  app.post('/join', function (req, res) {
    // TODO test if there's an active game under that pin,
    // if so, allow join and remove from cache
    var gamedata = games.join(req.session, req.body.pin);
    if (gamedata) {
      console.log('joining');
      req.session.playerId = gamedata.playerId;
      req.session.ingame = req.body.pin;
      res.redirect('/play');
    } else {
      console.log('failed joining');
      res.render('join');
    }
  });

  app.get('/play', function (req, res, next) {
    var game = games.get(req.session.ingame);
    console.log('in game', req.session.ingame, game);
    if (game) {
      var turn = game.isCurrentPlayer(req.session.playerId);
      res.render('player-a', {
        pin: req.session.ingame || 'null',
        player: {
          letter: req.session.playerId,
          turn: turn
        }
      });
    } else {
      res.redirect('/');
    }
  });

  app.get('/start', function (req, res) {
    var pin = req.session.pin;
    if (!req.session.pin) {
      pin = req.session.pin = games.getPin(req.session);
    }

    var gamedata = games.join(req.session, pin);

    req.session.playerId = gamedata.playerId;
    req.session.ingame = pin;

    res.render('start', {
      pin: req.session.pin
    });
  });
};