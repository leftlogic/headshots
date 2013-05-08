# TODO

- BUG: user can join same game twice to trigger it
- Position of video overlay is wrong on mobile
- z-index is wrong with video - ball is always in front of video
- Don't send orientation events unless neccessary
- Reconnect WebRTC if pin changes
- Send hit message
- Scoring
- Hit and swap go
- Exit game from any screen
- Update to use .min.js
- Hide screen on landscape
- If player leaves game for long enough, game disconnects
- Game over page
- Tilting is at a weird angle
- Error handling (if player leaves, if player tries to join without starting, connections dropped, hide on landscape orientation, etc)
- About & Information page
- x-browser testing/support
- don't throw ball on resume


# DONE

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
