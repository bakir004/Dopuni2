const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require('path');

const port = process.env.PORT || 3001;

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("./fe/build"));
  app.get("*", (req, res) => {
    if (path) res.sendFile(path.resolve(__dirname, "./fe/build/index.html"));
  });
}

const dictionary = require("./novi-rjecnik3.json");
const alphabet = "ABCČĆDEFGHIJKLMNOPRSŠTUVZŽ";

const server = http.createServer(app);
app.use(cors());
const io = require("socket.io")(server, {
  cors: { origin: "*", methods: ["GET", "POST", "UPDATE", "DELETE"] },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected " + socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected " + socket.id);

    const code = disconnectPlayer(socket.id);
    if (code !== "") {
      socket.leave(code);
      checkForHost(code);
      if (rooms[code]) io.to(code).emit("set-room", rooms[code]);
    }
  });

  //#region CHAT
  socket.on("chat", ({ message, code }) => {
    io.to(code).emit("chat", message);
  });
  //#endregion

  //#region GAME-MANAGER

  socket.on("join-game", ({ code, player }) => {
    player.lives = rooms[code].startingLives;
    player.isPlayer = true;
    rooms[code].players.push(player);
    const index = findIndex(player.id, rooms[code].spectators);
    rooms[code].spectators.splice(index, 1);
    io.to(code).emit("set-room", rooms[code]);
    io.to(code).emit("remove-winner");
  });

  socket.on("start-game", (code) => {
    rooms[code].gameRunning = true;
    rooms[code].currentPlayerIndex = 0;
    rooms[code].time = 0;
    rooms[code].lastInputTime = 0;
    rooms[code].letters = randomLetters(rooms[code].difficulty);
    rooms[code].words = [];
    increaseTimer(code);
    let object = {};
    for (let i = 0; i < alphabet.length; i++) {
      object[alphabet[i]] = false;
    }
    for (let i = 0; i < rooms[code].players.length; i++) {
      rooms[code].players[i].letters = { ...object };
      rooms[code].players[i].lives = rooms[code].startingLives;
    }

    io.to(code).emit("next-player", rooms[code]);
  });

  socket.on("player-typing", ({ word, id, code }) => {
    for (let i = 0; i < rooms[code].players.length; i++) {
      if (rooms[code].players[i].id === id) {
        rooms[code].players[i].word = word;
      }
    }
    io.to(code).emit("set-room", rooms[code]);
  });

  socket.on("word-submit", ({ word, id, code, letters }) => {
    if (word.toUpperCase() === "AEZAKMI") {
      let player = rooms[code].players.filter((obj) => {
        return obj.id === id;
      });
      endGame({ code, winner: player[0] });
    }
    if (
      dictionary[letters].includes(word.toUpperCase()) &&
      rooms[code].words.indexOf(word) === -1
    ) {
      rooms[code].words.push(word);
      const index = findIndex(id, rooms[code].players);
      for (let i = 0; i < word.length; i++) {
        rooms[code].players[index].letters[word[i].toUpperCase()] = true;
      }
      let foundUnused = false;
      for (let i = 0; i < alphabet.length; i++) {
        if (!rooms[code].players[index].letters[alphabet[i]])
          foundUnused = true;
      }
      if (!foundUnused) {
        for (let i = 0; i < alphabet.length; i++) {
          rooms[code].players[index].letters[alphabet[i]] = false;
        }
        rooms[code].players[index].lives++;
        if (rooms[code].players[index].lives > rooms[code].maxLives) {
          rooms[code].players[index].lives = rooms[code].maxLives;
        }
      }
      nextTurn(code);
    } else {
      // let player = rooms[code].players.filter((obj) => {
      //   return obj.id === id;
      // });
      // endGame({ code, winner: player[0] });

      io.to(code).emit("wrong-word", id);
      io.to(code).emit("correct-words", dictionary[letters]);
    }
  });
  //#endregion

  socket.on("get-room", (code) => {
    io.to(code).emit("set-room", rooms[code]);
  });

  socket.on("join-room", ({ code, id }) => {
    const player = getNewPlayer(id);

    if (player === null) return;

    socket.join(code);
    if (!rooms[code]) {
      player.isHost = true;
      rooms[code] = {
        players: [],
        gameRunning: false,
        currentPlayerIndex: null,
        time: 0,
        lastInputTime: 0,
        seconds: 7,
        startingLives: 3,
        maxLives: 4,
        difficulty: "easy",
      };
      player.lives = rooms[code].startingLives;
      rooms[code].spectators = [player];
    } else {
      player.lives = rooms[code].startingLives;
      rooms[code].spectators.push(player);
    }
    io.to(code).emit("set-room", rooms[code]);
  });
  socket.on("set-room-settings", ({ property, value, code }) => {
    rooms[code][property] = value;
    io.to(code).emit("set-room", rooms[code]);
  });
  socket.on("leave-room", (code) => {
    socket.leave(code);
    disconnectPlayer(socket.id);
    io.to(code).emit("set-room", rooms[code]);
  });
});

const randomLetters = (difficulty) => {
  let lowerLimit = 500;
  switch (difficulty) {
    case "easy": {
      lowerLimit = 500;
      break;
    }
    case "medium": {
      lowerLimit = 300;
      break;
    }
    case "hard": {
      lowerLimit = 100;
      break;
    }
  }
  let combination = "AAA";
  while (true) {
    combination =
      Object.keys(dictionary)[
        Math.round(Math.random() * Object.keys(dictionary).length)
      ];
    if (dictionary[combination] && dictionary[combination].length > lowerLimit)
      break;
  }

  return combination;
};

const checkForHost = (code) => {
  let count = 0;
  if (!rooms[code]) return;
  const playerHosts = rooms[code].players.filter((obj) => obj.isHost === true);
  count += playerHosts.length;
  const spectatorHosts = rooms[code].spectators.filter(
    (obj) => obj.isHost === true
  );
  count += spectatorHosts.length;
  if (count <= 0) {
    if (rooms[code].players.length >= 1) {
      rooms[code].players[0].isHost = true;
    } else {
      rooms[code].spectators[0].isHost = true;
    }
  }
};

const checkForWinner = (code) => {
  let count = 0,
    winner;
  rooms[code].players.forEach((player) => {
    if (player.connected && player.lives > 0) {
      count++;
      winner = player;
    }
  });
  if (count === 1) {
    return winner;
  } else {
    return null;
  }
};

const increaseTimer = (code) => {
  if (rooms[code].gameRunning) {
    rooms[code].time++;
    setTimeout(() => increaseTimer(code), 1000);
  }
};

const getNewPlayer = (id) => {
  if (!id) return null;
  const newPlayer = {
    username: `Guest-${id.substring(0, 5)}`,
    id,
    image:
      "https://thumbs.dreamstime.com/b/user-icon-glyph-gray-background-106603565.jpg",
    isHost: false,
    word: "",
    connected: true,
    lives: 3,
    letters: {},
    isPlayer: false,
  };
  for (let i = 0; i < alphabet.length; i++) {
    newPlayer.letters[alphabet[i]] = false;
  }

  return newPlayer;
};

const disconnectPlayer = (id) => {
  let code;
  try {
    for (const roomCode in rooms) {
      let player = findIndex(id, rooms[roomCode].players);
      let spectator = findIndex(id, rooms[roomCode].spectators);
      let index = player !== -1 ? player : spectator;
      let isPlayer = player !== -1 ? true : false;
      if (index === -1) {
        return "";
      } else {
        code = roomCode;
        if (rooms[code].gameRunning) {
          rooms[code].players[index].connected = false;

          const winner = checkForWinner(code);
          if (winner) {
            endGame({ code, winner });
            return code;
          }
          if (rooms[code].currentPlayerIndex === index) {
            nextTurn(code);
          }
        } else {
          if (rooms[code].players.length + rooms[code].spectators.length <= 1) {
            delete rooms[code];
            return code;
          }

          if (isPlayer) {
            if (rooms[code].players[index].isHost) {
              if (rooms[code].players.length === 1) {
                rooms[code].spectators[0].isHost = true;
              } else {
                rooms[code].players[
                  index + 1 >= rooms[code].players.length ? 0 : index + 1
                ].isHost = true;
              }
            }
            rooms[code].players.splice(index, 1);
          } else {
            if (rooms[code].spectators[index].isHost) {
              if (rooms[code].spectators.length === 1) {
                rooms[code].players[0].isHost = true;
              } else {
                rooms[code].spectators[
                  index + 1 >= rooms[code].spectators.length ? 0 : index + 1
                ].isHost = true;
              }
            }
            rooms[code].spectators.splice(index, 1);
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    return code;
  }
};

const findIndex = (id, arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) return i;
  }
  return -1;
};

const endGame = ({ code, winner }) => {
  rooms[code].gameRunning = false;
  rooms[code].spectators = rooms[code].spectators.concat(rooms[code].players);
  for (let i = 0; i < rooms[code].spectators.length; i++) {
    rooms[code].spectators[i].word = "";
    rooms[code].spectators[i].isPlayer = false;
  }
  rooms[code].players = [];
  for (let i = 0; i < rooms[code].spectators.length; i++) {
    if (!rooms[code].spectators[i].connected)
      rooms[code].spectators.splice(i, 1);
  }
  // if (rooms[code].spectators.length === 1) {
  //   rooms[code].spectators[0].isHost = true;
  // }
  clearInterval(rooms[code].interval);
  checkForHost(code);
  io.to(code).emit("end-game", winner);
  io.to(code).emit("set-room", rooms[code]);
};

const nextTurn = (code) => {
  incrementPlayerTurnIndex(code);
  while (
    !rooms[code].players[rooms[code].currentPlayerIndex].connected ||
    rooms[code].players[rooms[code].currentPlayerIndex].lives <= 0
  ) {
    incrementPlayerTurnIndex(code);
  }
  rooms[code].letters = randomLetters(rooms[code].difficulty);
  io.to(code).emit("next-player", rooms[code]);

  // timer
  rooms[code].lastInputTime = rooms[code].time;
  setTimeout(() => {
    if (rooms[code].time - rooms[code].lastInputTime >= rooms[code].seconds) {
      rooms[code].players[rooms[code].currentPlayerIndex].lives--;
      if (rooms[code].players[rooms[code].currentPlayerIndex].lives <= 0) {
        const winner = checkForWinner(code);
        if (winner) {
          endGame({ code, winner });
          return;
        }
      }
      nextTurn(code);
    }
  }, rooms[code].seconds * 1000 + 1000);
};

const incrementPlayerTurnIndex = (code) => {
  rooms[code].currentPlayerIndex++;
  if (rooms[code].currentPlayerIndex >= rooms[code].players.length) {
    rooms[code].currentPlayerIndex = 0;
  }
};

server.listen(port, () => console.log(`Listening on port ${port}`));
