"use strict";

var games = require('./game');


function sanitisePin(pin) {
  pin = parseInt(pin, 10);
  if ((pin + '').length > 4) {
    pin = (pin+'').substr(0, 4);
  }

  if (!pin) {
    pin = 1000 + (Math.random() * 8999 | 0);
  }

  return pin * 1;
}

module.exports = function (app) {
  app.get('/', function (req, res) {
    req.session.destroy();
    res.render('welcome');
  });

  app.param('pin', function (req, res, next) {
    req.pin = sanitisePin(req.param('pin'));
    next();
  });

  app.get('/test/:pin?', function (req, res, next) {
    var session = {};

    var pin = req.pin,
        game;

    if (pin) {
      game = games.get(pin);

      if (!game) {
        pin = games.getPin(session);
      }
    } else {
      pin = games.getPin(session);
      console.log('adding dummy join');
      games.join(pin); // dummy user
    }

    console.log('joining test game');

    var gamedata = games.join(pin);

    console.log('-------------------');
    console.log(gamedata);

    if (gamedata) {
      req.session.playerId = gamedata.playerId;
      req.session.ingame = pin;

      game = games.get(req.session.ingame);
      if (game) {
        return res.redirect('/play');
      } else {
        return res.redirect('/');
      }
    }

    next();
  });

  app.get('/status/:pin', function (req, res, next) {
    if (req.xhr) {
      if (req.params.pin) {
        var game = games.get(req.pin);
        console.log('xhr game', game);
        if (game.state === 'ready' || game.state === 'playing') {
          res.send(true);
        } else if (game.state === 'waiting') {
          console.log('waiting for game to start');

          // FIXME this event isn't being picked up at all
          game.on('state.ready', function () {
            res.send(true);
          });
        }
      }
    } else {
      next();
    }
  });

  app.get('/join/:pin', function (req, res) {
    var pin = req.pin,
        game = games.get(pin);

    if (!game) {
      game = games.create(pin);
    }

    if (!req.session.ingame && pin !== req.session.pin) {
      var gamedata = games.join(pin);

      req.session.pin = pin;
      req.session.playerId = gamedata.playerId;
      req.session.ingame = pin;
    }

    if (game.state === 'waiting') {
      res.render('start', {
        pin: pin
      });
    } else {
      res.redirect('/play');
    }
  });

  app.get('/join', function (req, res) {
    res.render('join');
  });

  app.post('/join', function (req, res) {
    // TODO test if there's an active game under that pin,
    // if so, allow join and remove from cache
    var pin = sanitisePin(req.body.pin),
        game = games.get(pin),
        gamedata = games.join(pin);

    if (gamedata) {
      req.session.playerId = gamedata.playerId;
      req.session.ingame = pin;
      res.redirect('/play');
    } else {
      console.log('failed joining - game may be full');
      res.render('join');
    }
  });

  app.all('/join', function (req, res, next) {
    if (req.session.ingame) {
      res.redirect('/play');
    } else {
      next();
    }
  });

  app.get('/play', function (req, res, next) {
    var game = games.get(req.session.ingame);

    if (game) {
      var turn = game.isCurrentPlayer(req.session.playerId),
          otherLetter = req.session.playerId === 'a' ? 'b' : 'a',
          me = {
            letter: req.session.playerId,
            score: game.getPlayerByLetter(req.session.playerId).score
          },
          them = {
            letter: otherLetter,
            score: game.getOtherPlayer(otherLetter).score
          };

      res.render('player', {
        pin: req.session.ingame || 'null',
        wide: true,
        game: JSON.stringify({
          me: me,
          them: them,
          currentPlayer: turn ? req.session.playerId : otherLetter,
          turn: turn
        }),
        player: {
          letter: req.session.playerId,
          turn: true, //turn
        }
      });
    } else {
      res.redirect('/');
    }
  });

  app.get('/start', function (req, res) {
    var pin = sanitisePin(req.session.pin);
    if (!req.session.pin) {
      pin = req.session.pin = games.getPin(req.session);
    }

    var game = games.get(pin);
    if (!game) {

    }

    var gamedata = games.join(pin);

    req.session.playerId = gamedata.playerId;
    req.session.ingame = pin;

    res.render('start', {
      pin: req.session.pin
    });
  });
};