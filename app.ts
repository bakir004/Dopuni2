const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3001;

import { wordSchema } from "./models/word";
import * as fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { PlayerInterface, RoomInterface } from "./models/interfaces";
import { createPlayer, createRoom } from "./creation-service";
import { alphabet, blankLetters } from "./vars";

//#region BODY-PARSER SETUP
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
//#endregion
//#region DICT HANDLING
let fileContent = fs.readFileSync("rjecnik-vol-8.txt", "utf8");
const allWordsFromDict = fileContent.split(/\r?\n/);
const dictionary = require("./novi-rjecnik3.json");
//#endregion
//#region DATABASE CONNECTION
const mongoose = require("mongoose");
// mongoose.connect(
//   "mongodb+srv://bakirdbuser:rikab004@dopunicluster.bbawyvr.mongodb.net/?retryWrites=true&w=majority"
// );
const Word = mongoose.model("Word", wordSchema);
//#endregion
//#region SOCKET.IO CONNECTION
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});
//#endregion
//#region HEROKU SETUP
if (process.env.NODE_ENV === "production") {
  app.use(express.static("./fe/build"));
}
//#endregion

const easyCombos = Object.keys(dictionary).filter(
  (key) => dictionary[key].length >= 500
);
const mediumCombos = Object.keys(dictionary).filter(
  (key) => dictionary[key].length >= 250 && dictionary[key].length < 500
);
const hardCombos = Object.keys(dictionary).filter(
  (key) => dictionary[key].length >= 50 && dictionary[key].length < 250
);

const rooms = {};
const players = {};
let cooldown = false;

const timeFunction = setInterval(() => {
  if (Object.keys(rooms).length <= 0) return;
  Object.keys(rooms).map((roomCode) => {
    if (rooms[roomCode] === undefined) return;
    if (rooms[roomCode].gameRunning) {
      rooms[roomCode].timer =
        Math.round((rooms[roomCode].timer - 0.1) * 10) / 10;
      if (rooms[roomCode].timer <= 0) {
        if (rooms[roomCode].players.length <= 0) return;
        if (rooms[roomCode].tempo === "sporo") {
          punish(
            rooms[roomCode].players[
              rooms[roomCode].playerTurn % rooms[roomCode].players.length
            ]
          );
          nextTurn(roomCode);
        } else {
          if (!cooldown) {
            rooms[roomCode].players.forEach((player: PlayerInterface) => {
              console.log("LIVES: " + player.lives);
            });
            rooms[roomCode].players.forEach((player: PlayerInterface) => {
              if (!player.done) {
                punish(player);
              }
            });
            rooms[roomCode].players.forEach((player: PlayerInterface) => {
              console.log("LIVES: " + player.lives);
            });
            cooldown = true;
          }
          setTimeout(() => {
            cooldown = false;
          }, 1000);

          nextTurn(roomCode);
        }
        refreshRoom(roomCode);
      }
      refreshRoom(roomCode);
    }
  });
}, 100);

const roomCheck = setInterval(() => {
  if (Object.keys(rooms).length <= 0) return;
  Object.keys(rooms).map((roomCode) => {
    if (rooms[roomCode] === undefined) return;
    if (rooms[roomCode].players.length === 0) return;
    if (
      rooms[roomCode].players.length + rooms[roomCode].spectators.length ===
      0
    ) {
      delete rooms[roomCode];
      rooms[roomCode] = undefined;
      return;
    }
    if (
      rooms[roomCode].players.findIndex(
        (_player: PlayerInterface) => _player.host
      ) === -1
    ) {
      rooms[roomCode].players[0].host = true;
    }
  });
}, 2000);

const punish = (player: PlayerInterface) => {
  const roomCode = player.room;
  if (rooms[roomCode] === undefined) return;

  if (rooms[roomCode].tempo === "sporo") {
    const indexOfPunishedPlayer =
      rooms[roomCode].playerTurn % rooms[roomCode].players.length;
    if (rooms[roomCode].players[indexOfPunishedPlayer] === undefined) return;

    if (rooms[roomCode].gamemode === "opstanak") {
      console.log(
        "punishes " + rooms[roomCode].players[indexOfPunishedPlayer].word
      );
      rooms[roomCode].players[indexOfPunishedPlayer].lives--;
      players[player.id].lives =
        rooms[roomCode].players[indexOfPunishedPlayer].lives;
    }
  } else {
    if (rooms[roomCode].gamemode === "opstanak") {
      const indexOfPlayer = rooms[roomCode].players.findIndex(
        (_player: PlayerInterface) => _player.id === player.id
      );
      rooms[roomCode].players[indexOfPlayer].lives--;
      players[player.id].lives = rooms[roomCode].players[indexOfPlayer].lives;
    }
  }

  checkForWinner(roomCode);
};

const reward = (player: PlayerInterface) => {
  const roomCode = player.room;
  if (rooms[roomCode] === undefined) return;

  const indexOfRewardedPlayer =
    rooms[roomCode].playerTurn % rooms[roomCode].players.length;
  if (rooms[roomCode].players[indexOfRewardedPlayer] === undefined) return;

  if (rooms[roomCode].gamemode === "opstanak") {
    rooms[roomCode].players[indexOfRewardedPlayer].lives++;
    if (
      rooms[roomCode].players[indexOfRewardedPlayer].lives >
      rooms[roomCode].maxLives
    )
      rooms[roomCode].players[indexOfRewardedPlayer].lives =
        rooms[roomCode].maxLives;
  } else if (rooms[roomCode].gamemode === "kolekcionar") {
    rooms[roomCode].players[indexOfRewardedPlayer].points += 300;
    if (
      rooms[roomCode].players[indexOfRewardedPlayer].points >=
      rooms[roomCode].maxPoints
    )
      winGame(player);
  } else winGame(player);
};

const checkForWinner = (roomCode: string) => {
  if (
    rooms[roomCode].players.filter(
      (_player: PlayerInterface) => _player.lives > 0 && _player.connected
    ).length === 1
  ) {
    const indexOfWinner = rooms[roomCode].players.findIndex(
      (_player: PlayerInterface) => _player.lives > 0 && _player.connected
    );
    winGame(rooms[roomCode].players[indexOfWinner]);
  } else if (
    rooms[roomCode].players.filter(
      (_player: PlayerInterface) => _player.lives > 0 && _player.connected
    ).length < 1
  ) {
    endGame(roomCode);
  }
  refreshRoom(roomCode);
};

const nextTurn = (roomCode: string) => {
  rooms[roomCode].playerTurn++;
  const indexOfCurrentPlayer =
    rooms[roomCode].playerTurn % rooms[roomCode].players.length;
  if (rooms[roomCode].players[indexOfCurrentPlayer] === undefined) return;
  if (rooms[roomCode].tempo === "sporo") {
    if (
      !rooms[roomCode].players[indexOfCurrentPlayer].connected ||
      rooms[roomCode].players[indexOfCurrentPlayer].lives <= 0
    )
      nextTurn(roomCode);
    else {
      io.to(rooms[roomCode].players[indexOfCurrentPlayer].id).emit(
        "clear-input"
      );
      rooms[roomCode].timer = rooms[roomCode].timePerTurn;
      rooms[roomCode].combination = getRandomCombination(rooms[roomCode]);
    }
  } else {
    for (let i = 0; i < rooms[roomCode].players.length; i++) {
      rooms[roomCode].players[i].done = false;
    }
    io.to(roomCode).emit("clear-input");
    rooms[roomCode].timer = rooms[roomCode].timePerTurn;
    rooms[roomCode].combination = getRandomCombination(rooms[roomCode]);
  }
};

const winGame = (player: PlayerInterface) => {
  const roomCode = player.room;
  if (rooms[roomCode] === undefined) return;
  rooms[roomCode].winner = player;
  endGame(roomCode);
  refreshRoom(roomCode);
};

const refreshRoom = (roomCode: string) => {
  io.to(roomCode).emit("refresh-room", rooms[roomCode]);
};

const disconnectPlayer = (playerId: string, roomCode: string) => {
  if (rooms[roomCode] === undefined) return;
  if (players[playerId] === undefined) return;
  const playerAvatarId = players[playerId].avatarId;
  const isHost = players[playerId].host;
  delete players[playerId]; // remove player from list of players

  console.log("disconnect func: " + playerId);

  let indexOfDisconnectedPlayer = rooms[roomCode].players.findIndex(
    (player: PlayerInterface) => player.id === playerId
  ); // get index of disconnected player in this room
  if (indexOfDisconnectedPlayer === -1) {
    indexOfDisconnectedPlayer = rooms[roomCode].spectators.findIndex(
      (player: PlayerInterface) => player.id === playerId
    );
    if (indexOfDisconnectedPlayer === -1) return;
    rooms[roomCode].spectators.splice(indexOfDisconnectedPlayer, 1); // remove player from spectators
  }

  if (rooms[roomCode].gameRunning) {
    rooms[roomCode].players[indexOfDisconnectedPlayer].connected = false;
    checkForWinner(roomCode);
    if (rooms[roomCode].tempo === "sporo") {
      if (
        rooms[roomCode].playerTurn % rooms[roomCode].players.length ===
        indexOfDisconnectedPlayer
      ) {
        nextTurn(roomCode);
        refreshRoom(roomCode);
      }
    }
    refreshRoom(roomCode);
  } else rooms[roomCode].players.splice(indexOfDisconnectedPlayer, 1); // remove player from players

  if (isHost) {
    if (rooms[roomCode].players[0] !== undefined)
      rooms[roomCode].players[0].host = true;
    else if (rooms[roomCode].spectators[0] !== undefined)
      rooms[roomCode].spectators[0].host = true;
  }

  const indexOfUsedAvatarId =
    rooms[roomCode].usedAvatarIds.indexOf(playerAvatarId);
  if (indexOfUsedAvatarId !== -1)
    rooms[roomCode].usedAvatarIds.splice(
      rooms[roomCode].usedAvatarIds.indexOf(playerAvatarId),
      1
    );

  if (rooms[roomCode].players.length === 0) {
    delete rooms[roomCode];
    rooms[roomCode] = undefined;
  }
};

const endGame = (roomCode: string) => {
  if (rooms[roomCode] === undefined) return;
  rooms[roomCode].gameRunning = false;
  while (rooms[roomCode].spectators.length > 0) {
    const player = rooms[roomCode].spectators.pop();
    rooms[roomCode].players.push(player);
  }
  const connectedPlayers = rooms[roomCode].players.filter(
    (player: PlayerInterface) => player.connected
  );
  rooms[roomCode].players = [...connectedPlayers];
};

const getRandomCombination = (room: RoomInterface) => {
  let combination = "EZ";
  if (room.difficulty === "lahko")
    combination =
      easyCombos[Math.round(Math.random() * Object.keys(easyCombos).length)];
  else if (room.difficulty === "srednje")
    combination =
      mediumCombos[
        Math.round(Math.random() * Object.keys(mediumCombos).length)
      ];
  else
    combination =
      hardCombos[Math.round(Math.random() * Object.keys(hardCombos).length)];

  io.to(room.code).emit("words", dictionary[combination]);
  return combination;
};

io.on("connection", (socket) => {
  console.log("Connected: " + socket.id);

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.id);

    if (players[socket.id] === undefined) return;

    const roomCode = players[socket.id].room; // get room code of player

    disconnectPlayer(socket.id, roomCode);
    socket.leave(roomCode); // remove from emission loops
    refreshRoom(roomCode);
  });

  socket.on("create-room", ({ playerId }) => {
    if (!playerId) return;
    var randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var roomCode = "";
    for (var i = 0; i < 4; i++) {
      roomCode += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    rooms[roomCode] = createRoom(roomCode);
    io.to(playerId).emit("join-room", { roomCode });
  });

  socket.on("check-for-room", ({ roomCode, playerId }) => {
    if (rooms[roomCode] === undefined) return;
    if (rooms[roomCode].players.length + rooms[roomCode].spectators.length >= 8)
      return;
    io.to(playerId).emit("join-room", { roomCode });
  });

  socket.on("join-room", ({ roomCode, playerId }) => {
    if (players[playerId] !== undefined) return; // if player already exists
    if (rooms[roomCode] === undefined) {
      io.to(playerId).emit(
        "error-modal",
        "Soba u koju pokušavate ući ne postoji."
      );
      return io.to(playerId).emit("redirect-to-dashboard"); // if room doesnt exist dont let him in
    }

    if (
      rooms[roomCode].players.length + rooms[roomCode].spectators.length >=
      8
    ) {
      io.to(playerId).emit(
        "error-modal",
        "Soba u koju pokušavate ući je puna."
      );
      return io.to(playerId).emit("redirect-to-dashboard"); // if room is full
    }

    const player = createPlayer(playerId, "...");
    player.room = roomCode; // set players room
    player.connected = true;

    // avatar selection process; random but unique
    let randomAvatarId = 0,
      counter = 0;
    while (true) {
      randomAvatarId = Math.floor(Math.random() * 8 + 1);
      counter++;
      if (counter > 1000) {
        player.avatarId = randomAvatarId;
        rooms[roomCode].usedAvatarIds.push(randomAvatarId);
        break;
      }
      if (rooms[roomCode].usedAvatarIds.indexOf(randomAvatarId) === -1) {
        player.avatarId = randomAvatarId;
        rooms[roomCode].usedAvatarIds.push(randomAvatarId);
        break;
      }
    }

    if (rooms[roomCode].players.length === 0) player.host = true;

    if (rooms[roomCode].gameRunning) rooms[roomCode].spectators.push(player);
    else rooms[roomCode].players.push(player); // add player to room

    players[playerId] = player; // add player to list of players

    socket.join(roomCode); // join in emission loops
    console.log(rooms[roomCode]);

    refreshRoom(roomCode);
  });

  socket.on("leave-room", ({ playerId, roomCode }) => {
    if (players[playerId] === undefined) return;
    if (rooms[roomCode] === undefined) return;

    console.log("leave-room");

    disconnectPlayer(playerId, roomCode);
    socket.leave(roomCode); // remove from emission loop
    refreshRoom(roomCode);
  });

  socket.on("update-name", ({ playerId, playerName }) => {
    if (players[playerId] === undefined) return;

    players[playerId].name = playerName; // update name in list of players
    const roomCode = players[playerId].room; // get room of player

    if (rooms[roomCode] === undefined) return;

    const indexOfUpdatedPlayer = rooms[roomCode].players.findIndex(
      (player) => player.id === playerId
    ); // get his index

    if (indexOfUpdatedPlayer === -1) return;

    rooms[roomCode].players[indexOfUpdatedPlayer].name = playerName; // update players name in rooms

    refreshRoom(roomCode);
  });

  socket.on(
    "room-settings",
    ({
      roomCode,
      difficulty,
      gamemode,
      timePerTurn,
      startLives,
      maxLives,
      maxPoints,
      djIncluded,
      tempo,
    }) => {
      if (rooms[roomCode] === undefined) return;
      rooms[roomCode]["difficulty"] = difficulty;
      rooms[roomCode]["gamemode"] = gamemode;
      rooms[roomCode]["timePerTurn"] = timePerTurn;
      rooms[roomCode]["startLives"] = startLives;
      rooms[roomCode]["maxLives"] = maxLives;
      rooms[roomCode]["maxPoints"] = maxPoints;
      rooms[roomCode]["djIncluded"] = djIncluded;
      rooms[roomCode]["tempo"] = tempo;
      refreshRoom(roomCode);
    }
  );

  socket.on("start-game", (roomCode: string) => {
    if (rooms[roomCode] === undefined) return;

    rooms[roomCode].players.forEach((player: PlayerInterface) => {
      player.word = "";
      player.lives = rooms[roomCode].startLives;
      player.points = 0;
      (player.letters = blankLetters), (players[player.id].word = "");
      players[player.id].lives = rooms[roomCode].startLives;
      players[player.id].points = 0;
      players[player.id].letters = { ...blankLetters };
    });

    rooms[roomCode].playerTurn = 0;
    rooms[roomCode].gameRunning = true;
    rooms[roomCode].timer = rooms[roomCode].timePerTurn;
    rooms[roomCode].combination = getRandomCombination(rooms[roomCode]);
    rooms[roomCode].usedWords = [];

    refreshRoom(roomCode);
  });

  socket.on("word-typing", ({ roomCode, playerId, word }) => {
    if (rooms[roomCode] === undefined) return;
    if (players[playerId] === undefined) return;

    const indexOfTypingPlayer = rooms[roomCode].players.findIndex(
      (player: PlayerInterface) => player.id === playerId
    ); // get his index
    if (indexOfTypingPlayer === -1) return;

    players[playerId].word = word;
    rooms[roomCode].players[indexOfTypingPlayer].word = word;

    refreshRoom(roomCode);
  });

  socket.on("submit-word", ({ roomCode, playerId, word }) => {
    if (rooms[roomCode] === undefined) return;
    if (players[playerId] === undefined) return;
    if (word === "") return;
    word = word.toUpperCase();
    word = word.trim();

    if (word.toUpperCase() === "1337") {
      winGame(players[playerId]);
      return;
    }

    if (dictionary[rooms[roomCode].combination] !== undefined) {
      if (dictionary[rooms[roomCode].combination].indexOf(word) === -1) {
        io.to(playerId).emit("word-error", "Riječ nije prihvatljiva!");
        return;
      } else if (rooms[roomCode].usedWords.indexOf(word) !== -1) {
        io.to(playerId).emit("word-error", "Riječ je već iskorištena!");
        return;
      }
    }

    let indexOfSubmittingPlayer;
    if (rooms[roomCode].tempo === "sporo")
      indexOfSubmittingPlayer =
        rooms[roomCode].playerTurn % rooms[roomCode].players.length;
    else
      indexOfSubmittingPlayer = rooms[roomCode].players.findIndex(
        (player) => player.id === playerId
      );

    if (rooms[roomCode].players[indexOfSubmittingPlayer] === undefined) return;

    for (let i = 0; i < word.length; i++) {
      rooms[roomCode].players[indexOfSubmittingPlayer].letters[word[i]] = true;
    }
    if (rooms[roomCode].gamemode === "kolekcionar") {
      rooms[roomCode].players[indexOfSubmittingPlayer].points +=
        word.length * 3;
      if (
        rooms[roomCode].players[indexOfSubmittingPlayer].points >=
        rooms[roomCode].maxPoints
      )
        winGame(rooms[roomCode].players[indexOfSubmittingPlayer]);
    }

    if (rooms[roomCode].gamemode === "alfabet") {
      if (rooms[roomCode].djIncluded) {
        if (
          Object.values(
            rooms[roomCode].players[indexOfSubmittingPlayer].letters
          ).every((letter) => letter === true)
        ) {
          rooms[roomCode].players[indexOfSubmittingPlayer].letters = {
            ...blankLetters,
          };
          reward(players[playerId]);
        }
      } else {
        if (
          Object.keys(
            rooms[roomCode].players[indexOfSubmittingPlayer].letters
          ).every(
            (letter) =>
              letter === "Đ" ||
              rooms[roomCode].players[indexOfSubmittingPlayer].letters[letter]
          )
        ) {
          rooms[roomCode].players[indexOfSubmittingPlayer].letters = {
            ...blankLetters,
          };
          reward(players[playerId]);
        }
      }
    } else {
      if (
        Object.keys(
          rooms[roomCode].players[indexOfSubmittingPlayer].letters
        ).every(
          (letter) =>
            letter === "Đ" ||
            rooms[roomCode].players[indexOfSubmittingPlayer].letters[letter]
        )
      ) {
        rooms[roomCode].players[indexOfSubmittingPlayer].letters = {
          ...blankLetters,
        };
        reward(players[playerId]);
      }
    }

    if (rooms[roomCode].tempo === "blic") {
      rooms[roomCode].players[indexOfSubmittingPlayer].done = true;
    }

    rooms[roomCode].usedWords.push(word);

    if (rooms[roomCode].tempo === "blic") {
      if (
        rooms[roomCode].players.every((player: PlayerInterface) => player.done)
      )
        nextTurn(roomCode);
    } else {
      nextTurn(roomCode);
    }
    // console.log(rooms[roomCode].players)

    refreshRoom(roomCode);
  });

  socket.on("clear-winner", (roomCode: string) => {
    if (rooms[roomCode] === undefined) return;
    rooms[roomCode].winner = null;
    refreshRoom(roomCode);
  });

  socket.on("refresh-room", (roomCode: string) => {
    if (rooms[roomCode] === undefined) return;
    refreshRoom(roomCode);
  });
});

//#region REQUESTS
app.get("/words", (req: any, res: any) => {
  Word.find({}, (err, docs) => {
    if (err) return res.send(err);
    return res.send(docs);
  });
});

app.post("/words", (req: any, res: any) => {
  const text = req.body.text;
  const word = new Word({ text });
  word.save((err, doc) => {
    if (err) return res.send(err);
    return res.send(doc);
  });
});

app.put("/words/:id", (req: any, res: any) => {
  const text = req.body.text;
  const id = req.params.id;
  const word = { text };
  Word.findByIdAndUpdate(id, word, (err, doc) => {
    if (err) return res.send(err);
    return res.send(doc);
  });
});

app.delete("/words/:id", (req: any, res: any) => {
  const id = req.params.id;
  Word.findByIdAndDelete(id, (err, doc) => {
    if (err) return res.send(err);
    return res.send(doc);
  });
});
//#endregion

httpServer.listen(port, () => console.log(`Listening on port ${port}`));
