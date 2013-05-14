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

[x] Information page
[x] "Play again" enough times and it's both player's turn
[x] Game shouldn't start until connection is established
[x] If resize, video shouldn't reappear when game over etc.
[x] Play again / reset button
[x] Game over page
[x] Add game over winner head
[x] Loser doesn't get game over event
[x] Hit too quick
[x] When hit, video appears over hit image
[x] Scale the degree of throwing on the y axis
[x] Page too tall with "Hit!" screen
[x] Turn gets fucked
[x] About 
[x] BUG: http doesn't work online (and can't redirect)
[x] pin to front
[x] Hit and swap go
[x] BUG: don't throw ball on resume
[x] Throw start position doesn't quite match (map x, y to 0-1)
[x] Scoring
[x] Tilt video when player is tilting
[x] force https
[x] SSL cert
[x] Tilting is at a weird angle
[x] Send hit message
[x] Don't send orientation events unless neccessary
[x] z-index is wrong with video - ball is always in front of video
[x] BUG: user can join same game twice to trigger it
[x] Position of video overlay is wrong on mobile
[x] If player hits root (/) then exit any game they were in
[x] Leaning needs to be inverted
[x] Don't connect to gum until you have a pin
[x] remote pause
[x] Test https ws
[x] Throwing the ball in to 3d space
[x] BUG: both players are turn:false
[x] Send throw messages
[x] Hit test
[x] Align video to TV head
