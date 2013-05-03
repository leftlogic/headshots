Join logic:

/join

- Asks user for pin code
- If user enters pin code and game available, start game
- If user enters pin & no game available, changes to "start" page

/join/:pin

- If no game with pin, create game, join, and redirect to start
- If game with pin, join and start playing.
- If game is full redirect to /join

/start

Gives user pin code