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
  initialize: function() {
    // do stuff here if you want to perform more setup work
    // this executes prior to any state transitions or handler invocations
  },
  initialState: 'waiting',
  states: {
    waiting: {
      join: function (data) {
        this.players.push({ score: 0, data: data });
        if (this.players.length === 2) {
          this.transition('ready');
        }
      },
      playturn: function () {
        this.deferUntilNextTransition();
      }
    },
    ready: {
      _onEnter: function () {
        this.currentPlayer = Math.random() + 0.5 | 0;
        console.log('emitting start-game');
        this.trigger('start-game');
        this.transition('playing');
      }
    },
    playing: {
      playturn: function (data) {
        // will read data to ensure it's an actual hit
        if (data.hit) {
          this.players[this.currentPlayer].score++;
        }
        this.turnsleft--;

        // swap player
        this.currentPlayer = 1 - this.currentPlayer;

        if (this.turnsleft === 0) {
          this.transition('gameover');
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
  winner: null,
  players: [],
  currentPlayer: null,
  turnsleft: 10, // n * players.length
  playturn: function (data) {
    this.handle('playturn', data);
  },
  join: function (data) {
    this.handle('join', data);
  },
  isCurrentPlayer: function (playerId) {
    return playerId === this.currentPlayer;
  }
});

var games = {};

var PLAYER_A = 1;
var PLAYER_B = 2;

function getPin(session) {
  var pin = 1000 + (Math.random() * 8999 | 0);

  // pin = '1234';

  if (games[pin]) {
    pin = getPin();
  } else {
    games[pin] = new Game();
    games[pin].on('transition', function ( data ) {
      console.log('transitioning from ' + data.fromState + ' to ' + data.toState);
    });

    session.player = PLAYER_A;
  }

  return pin;
}

module.exports = {
  getPin: getPin,
  join: function (session, pin) {
    var game;
    console.log('looking up game', pin, games[pin]);
    // TODO what if they're already in the game?
    if (games[pin] && games[pin].state === 'waiting') {
      session.player = PLAYER_B;
      game = games[pin];
      game.join(session.PLAYER_B);
      return true;
    } else {
      // the game requested isn't available
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
  }
};