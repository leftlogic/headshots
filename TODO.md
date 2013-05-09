# TODO

- Game over page
- Page too tall with hit screen
- BUG: single tap on mobile does weird things
- BUG: http doesn't work online
- Update to use build.min.js
- If player leaves game for long enough, when user (disconnects), show connection issue (after X time)
- Error handling (if player leaves, if player tries to join without starting, connections dropped, hide on landscape orientation, etc)
- About & Information page
- use put varnish in front of game

# TODO...one day

- Exit game from any screen
- If resize, video shouldn't reappear when game over etc.
- BUG: /join/1234 doesn't work
- Hide screen on landscape
- x-browser testing/support
- Reconnect WebRTC if pin changes
- Protect score...somehow
- Tilt screen (css rotate) when player tilts (or...is that required?)
- Delay throwing by the latency

# DONE

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
