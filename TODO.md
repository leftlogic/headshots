# TODO

- If player leaves game for long enough, when user (disconnects), show connection issue (after X time)
- If you win, you should see your own face, not the other player's face
- BUG: single tap on mobile does weird things
- Error handling (if player leaves, if player tries to join without starting, connections dropped, hide on landscape orientation, etc)
- use put varnish in front of game

# TODO...one day

- build.min.js causes errors
- Sync up events (it should be fine if both on same wifi)
- Exit game from any screen
- BUG: /join/1234 doesn't work
- Hide screen on landscape
- x-browser testing/support
- Reconnect WebRTC if pin changes
- Protect score...somehow
- Tilt screen (css rotate) when player tilts (or...is that required?)
- Delay throwing by the latency
- BUG: sometimes only the bg renders (no longer happening?)

# DONE

* Information page
* "Play again" enough times and it's both player's turn
* Game shouldn't start until connection is established
* If resize, video shouldn't reappear when game over etc.
* Play again / reset button
* Game over page
* Add game over winner head
* Loser doesn't get game over event
* Hit too quick
* When hit, video appears over hit image
* Scale the degree of throwing on the y axis
* Page too tall with "Hit!" screen
* Turn gets fucked
* About 
* BUG: http doesn't work online (and can't redirect)
* pin to front
* Hit and swap go
* BUG: don't throw ball on resume
* Throw start position doesn't quite match (map x, y to 0-1)
* Scoring
* Tilt video when player is tilting
* force https
* SSL cert
* Tilting is at a weird angle
* Send hit message
* Don't send orientation events unless neccessary
* z-index is wrong with video - ball is always in front of video
* BUG: user can join same game twice to trigger it
* Position of video overlay is wrong on mobile
* If player hits root (/) then exit any game they were in
* Leaning needs to be inverted
* Don't connect to gum until you have a pin
* remote pause
* Test https ws
* Throwing the ball in to 3d space
* BUG: both players are turn:false
* Send throw messages
* Hit test
* Align video to TV head
