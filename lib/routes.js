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
    // if they were in a game, the remove them from the game, and destroy if it's now available
    if (req.session.ingame) {
      // player should leave this game first
      games.get(req.session.ingame).leave(req.session.playerId);
    }
    req.session.destroy();
    res.render('welcome');
  });

  app.get('/stats', function (req, res) {
    res.send('<pre>' + JSON.stringify(games.stats, null, ' ') + '</pre>');
  });

  app.get('/about', function (req, res) {
    res.render('about');
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
      games.join(pin, { session: {} }, { ua: req.headers['user-agent'] }); // dummy user
    }

    console.log('joining test game');

    var gamedata = games.join(pin, { session: {} }, { ua: req.headers['user-agent'] });



    console.log('-------------------');
    console.log(gamedata.game.players);

    if (gamedata) {
      req.session.playerId = gamedata.playerId;
      req.session.ingame = pin;
      req.session.debug = true;

      game = games.get(req.session.ingame);
      if (game) {
        return res.redirect('/play');
      } else {
        return res.redirect('/');
      }
    }

    next();
  });

  app.get('/hit', function (req, res, next) {
    if (req.xhr) {
      // check game
      var pin = req.session.ingame,
          game = games.get(pin);

      if (game && game.state === 'playing') {
        // allow a hit
        game.playturn({ playerId: req.session.playerId });
      }
    }
    res.send(true);
  });

  app.get('/throw', function (req, res, next) {
    if (req.xhr) {
      // check game
      var pin = req.session.ingame,
          game = games.get(pin);

      if (game && game.state === 'playing') {
        // allow a hit
        game.throwball({ playerId: req.session.playerId });
      }
    }
    res.send(true);
  });

  app.get('/status/:pin?', function (req, res, next) {
    var pin = req.params.pin,
        game = games.get(req.pin);
    if (req.xhr) {
      if (pin && game) {
        var ready = function () {
          console.log(game);
          var turn = game.isCurrentPlayer(req.session.playerId),
              otherLetter = req.session.playerId === 'a' ? 'b' : 'a',
              me = {
                letter: req.session.playerId,
                score: game.getPlayerByLetter(req.session.playerId).score
              },
              them = {
                letter: otherLetter,
                score: game.getPlayerByLetter(otherLetter).score
              };

          res.send({
            type: 'ready',
            data: {
              towin: game.towin,
              gameover: game.state === 'gameover',
              me: me,
              them: them,
              currentPlayer: turn ? req.session.playerId : otherLetter,
              turn: req.session.debug ? true : turn
            }
          });
        };

        if (game.state === 'ready' || game.state === 'playing' || game.state === 'gameover') {
          ready();
        } else if (game.state === 'waiting') {
          console.log('waiting for game to start');

          // FIXME this event isn't being picked up at all
          game.on('state.ready', ready);
        }
      } else {
        // start a game
        pin = req.session.pin = games.getPin(req.session);

        game = games.get(pin);
        var gamedata = games.join(pin, req, { ua: req.headers['user-agent'] });

        req.session.playerId = gamedata.playerId;
        req.session.ingame = pin;
        res.send({
          type: 'start',
          data: {
            pin: pin
          }
        });
      }
    } else {
      next();
    }
  });

  app.get('/dump/:pin', function (req, res) {
    var game = games.get(req.pin);
    res.send('<pre>' + JSON.stringify(game, null, ' ') + '</pre>');
  });

  app.get('/playagain', function (req, res, next) {
    if (req.session.ingame) {
      var game = games.get(req.session.ingame);
      game.playagain();
      res.send(true);
    } else {
      next();
    }
  });

  app.get('/other-player-left', function (req, res) {
    var result = false;
    if (req.session.ingame) {
      // player should leave this game first
      var game = games.get(req.session.ingame);
      game.leave(game.getOtherPlayer(req.session.playerId).id);
    }
    res.send(result);
  });

  app.post('/join', function (req, res) {
    // TODO test if there's an active game under that pin,
    // if so, allow join and remove from cache
    var pin = sanitisePin(req.body.pin),
        game = games.get(pin),
        gamedata;

    if (!game) {
      game = games.create(pin);
    }

    if (req.session.ingame) {
      // player should leave this game first
      games.get(req.session.ingame).leave(req.session.playerId);
    }

    gamedata = games.join(pin, req, { ua: req.headers['user-agent'] });

    if (gamedata) {
      req.session.playerId = gamedata.playerId;
      req.session.ingame = pin;

      if (req.xhr) {
        res.send(true);
      } else {
        res.redirect('/play');
      }
    } else if (game) {
      console.log('failed joining - game may be full');
      if (req.xhr) {
        res.send(false);
      } else {
        res.render('join', {
          'message': "That game is full!"
        });
      }
    } else if (req.xhr) {
      console.log('no game data');
      res.send(false);
    } else {
      res.redirect('/join/' + pin);
    }
  });

  app.get(['/play', '/join', '/start', '/join/:pin?', '/start/:pin?'], function (req, res, next) {
    var debug = req.session.debug || false;

    res.render('player', {
      pin: req.session.ingame || 'null',
      wide: true,
      debug: debug
      // player: {
      //   letter: req.session.playerId,
      //   turn: turn
      // }
    });
  });
};