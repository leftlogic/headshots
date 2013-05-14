/*

States:

WAITING - Needs two players to join

READY - all players have joined, now first player to go

PLAYER_A - player A needs to take their turn

PLAYER_B - player B needs to take their turn

GAME_OVER - all turns are over

Actions:

- join - if there's two players, then game state changes to ready
- playturn - a player takes their turn, it might be the next player's turn or game over


*/

"use strict";

var _ = require('underscore');
var machina = require('machina')(_);

var stats = {
  created: 0,
  played: 0,
  playing: [],
  hits: 0,
  finished: 0
};

var Game = machina.Fsm.extend({
  initialize: function(pin) {
    // do stuff here if you want to perform more setup work
    // this executes prior to any state transitions or handler invocations
    var self = this;
    self.on('transition', function (data) {
      setTimeout(function () {
        console.log(pin + ' transitioning from ' + data.fromState + ' to ' + data.toState);
        self.trigger('state.' + data.toState, { previousState: data.fromState });
      }, 0);
    });

    this.pin = pin;

    this.towin = 3;

    stats.created++;

    this.reset();
  },
  initialState: 'waiting',
  states: {
    waiting: {
      _onEnter: function () {
        if (this.pin) {
          var i = stats.playing.indexOf(this.pin);
          if (i) {
            stats.playing.splice(i, 1);
          }
        }
      },
      join: function (data) {
        var id = this.playerIds.shift();
        this.players.push({ score: 0, data: data, id: id });

        if (this.players.length === 2) {
          this.transition('ready');

          // note: this really belongs in the ready state
          // but onEnter don't let triggered events fire
          // https://github.com/ifandelse/machina.js/issues/18
          this.trigger('start-game');
        }

        return id;
      },
      playturn: function () {
        this.deferUntilNextTransition();
      },
      leave: function () {
        this.reset();
      }
    },
    ready: {
      _onEnter: function () {
        stats.played++;
        stats.playing.push(this.pin);
        this.currentPlayer = Math.random() + 0.5 | 0;
        this.transition('playing');
      }
    },
    playing: {
      leave: function (letter) {
        var player = this.getPlayerByLetter(letter),
            other = this.getOtherPlayer(letter);

        this.reset();

        // if there's anyone left, then add them in to the game
        if (other) {
          this.join(other.data);
        }
        return true;
      },
      throwball: function () {
        this.currentPlayer = 1 - this.currentPlayer;
      },
      playturn: function (data) {
        // will read data to ensure it's an actual hit
        this.setCurrentPlayer(data.playerId);
        if (this.isCurrentPlayer(data.playerId)) {
          this.players[this.currentPlayer].score++;

          stats.hits++;

          if (this.players[0].score === this.towin || this.players[1].score === this.towin) {
            this.transition('gameover');
          }
        }
      }
    },
    gameover: {
      _onEnter: function () {
        stats.playing.splice(stats.playing.indexOf(this.pin), 1);
        stats.finished++;
        // find out who won
        if (this.players[0].score > this.players[1].score) {
          this.winner = 0;
        } else if (this.players[0].score === this.players[1].score) {
          this.winner = null;
        } else {
          this.winner = 1;
        }
      },
      playagain: function () {
        this.players.forEach(function (p) {
          p.score = 0;
        });
        this.winner = null;
        this.transition('ready');
      }
    }
  },
  lastPlayerToJoin: function () {
    return this.players[this.players.length - 1].id;
  },
  playturn: function (data) {
    this.handle('playturn', data);
  },
  setCurrentPlayer: function (letter) {
    _.each(this.players, function (player, i) {
      if (player.id === letter) {
        this.currentPlayer = i;
      }
    }.bind(this));
  },
  throwball: function (letter) {
    // this is stupid, but I'll put it here
    this.setCurrentPlayer(letter);
    this.handle('throwball');
  },
  getPlayerByLetter: function (letter) {
    return _.filter(this.players, function (player) {
      return player.id === letter;
    }.bind(this))[0];
  },
  getOtherPlayer: function (letter) {
    return _.filter(this.players, function (player) {
      return player.id !== letter;
    }.bind(this))[0];
  },
  reset: function () {
    this.winner = null;
    this.playerIds = ['a', 'b'];
    this.players = [];
    this.currentPlayer = null;
    this.transition('waiting');
  },
  playagain: function () {
    this.handle('playagain');
  },
  join: function (data) {
    this.handle('join', data);
    return this.lastPlayerToJoin();
  },
  leave: function (data) {
    return this.handle('leave', data);
  },
  isCurrentPlayer: function (playerId) {
    if (this.currentPlayer === null) {
      return false;
    }
    return playerId === this.players[this.currentPlayer].id;
  }
});

var games = {};

var PLAYER_A = 1;
var PLAYER_B = 2;

function getPin(session) {
  if (!session) session = {};
  var pin = session.pin || 1000 + (Math.random() * 8999 | 0);

  // pin = '1234';

  if (games[pin]) {
    pin = getPin();
  } else {
    games[pin] = new Game(pin);
  }

  return pin;
}

module.exports = {
  stats: stats,
  getPin: getPin,
  join: function (pin, req, data) {
    var game = games[pin];

    if (game && game.state === 'waiting' && !req.session.playerId) {
      // could have been return { playerId: game.join() }
      // but that's dodgy to read.
      var playerId = game.join(data);
      return {
        game: game,
        playerId: playerId
      };
    } else if (req.session.ingame && req.session.playerId) {
      return {
        game: game,
        playerId: req.session.playerId
      };
    } else {
      // in theory - you shouldn't try to join a game
      // that's not available...
      return false;
    }
  },
  status: function (pin) {
    if (games[pin]) {
      return games[pin].state;
    } else {
      return 'unknown';
    }
  },
  get: function (pin) {
    return games[pin];
  },
  create: function (pin) {
    var game = this.get(pin);
    if (game) {
      game.reset();
    } else {
      game = new Game(pin);
      games[pin] = game;
    }

    return game;
  }
};