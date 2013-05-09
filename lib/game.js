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

    this.reset();
  },
  initialState: 'waiting',
  states: {
    waiting: {
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
        this.currentPlayer = Math.random() + 0.5 | 0;
        this.transition('playing');
      }
    },
    playing: {
      leave: function (letter) {
        var player = this.getPlayerByLetter(letter),
            other = this.getOtherPlayer(letter);

        if (this.players.length < 1) {
          this.reset();
          this.transition('waiting');

          // if there's anyone left, then add them in to the game
          if (this.players.length) {
            this.join(other);
          }
        }
      },
      playturn: function (data) {
        // will read data to ensure it's an actual hit
        if (this.isCurrentPlayer(data.playerId)) {
          this.players[this.currentPlayer].score++;
          this.turnsleft--;

          // swap player
          this.currentPlayer = 1 - this.currentPlayer;

          if (this.turnsleft === 0) {
            this.transition('gameover');
          }
        }
      }
    },
    gameover: {
      _onEnter: function () {
        // find out who won
        if (this.players[0].score > this.players[1].score) {
          this.winner = 0;
        } else if (this.players[0].score === this.players[1].score) {
          this.winner = null;
        } else {
          this.winner = 1;
        }
      }
    }
  },
  lastPlayerToJoin: function () {
    return this.players[this.players.length - 1].id;
  },
  playturn: function (data) {
    this.handle('playturn', data);
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
    this.turnsleft = 10; // n * players.length
  },
  join: function (data) {
    this.handle('join', data);
    return this.lastPlayerToJoin();
  },
  leave: function (data) {
    this.handle('leave', data);
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
  getPin: getPin,
  join: function (pin, req) {
    var game = games[pin];

    if (game && game.state === 'waiting' && !req.session.playerId) {
      // could have been return { playerId: game.join() }
      // but that's dodgy to read.
      var playerId = game.join();
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