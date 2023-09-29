import { FunctionComponent, useState, useEffect, useContext } from "react";
import NameModal from "../components/name-modal";
import SettingsModal from "../components/settings-modal";
import Lobby from "../components/lobby";
import {
  blankPlayer,
  blankRoom,
  PlayerInterface,
  RoomInterface,
} from "../config/config";
import { SocketContext } from "../socket";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Game from "../components/game";
import Button from "../components/button";

interface RoomProps {}

const playersYOffset = -20;
const playersXOffset = -8;
let playersCenterDistance = 200;

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

const Room: FunctionComponent<RoomProps> = () => {
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [display, setDisplay] = useState(true);
  const [settingsShow, setSettingsShow] = useState(false);
  const [settingsDisplay, setSettingsDisplay] = useState(false);

  const [gamemode, setGamemode] = useState("opstanak");
  const [difficulty, setDifficulty] = useState("lahko");
  const [timePerTurn, setTimePerTurn] = useState(10);
  const [startLives, setStartLives] = useState(3);
  const [maxLives, setMaxLives] = useState(4);
  const [maxPoints, setMaxPoints] = useState(300);
  const [djIncluded, setDjIncluded] = useState(false);
  const [tempo, setTempo] = useState("blic");

  const [word, setWord] = useState("");
  const [wordError, setWordError] = useState("");
  const [loading, setLoading] = useState(true);

  const [room, setRoom] = useState<RoomInterface>(blankRoom);
  const [player, setPlayer] = useState<PlayerInterface>(blankPlayer);

  const { width } = useWindowDimensions();
  const socket = useContext(SocketContext);
  const url = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (width > 640) playersCenterDistance = 200;
    else if (width > 420) playersCenterDistance = 150;
    else if (width <= 420) playersCenterDistance = 110;
  }, [width]);

  useEffect(() => {
    if (width > 640) playersCenterDistance = 200;
    else if (width > 420) playersCenterDistance = 150;
    else if (width <= 420) playersCenterDistance = 112;

    if (socket.id !== undefined)
      socket.emit("join-room", {
        roomCode: getRoomCodeFromURL(),
        playerId: socket.id,
      });

    setTimeout(() => {
      setLoading(false);
      openNameModal();
    }, 500);

    return () => {
      console.log("room-unmount");
      socket.emit("leave-room", {
        playerId: socket.id,
        roomCode: getRoomCodeFromURL(),
      });
    };
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("join-room", {
        roomCode: getRoomCodeFromURL(),
        playerId: socket.id,
      });
    });
    socket.on("refresh-room", (_room: RoomInterface) => {
      setRoom({ ..._room });
      setGamemode(_room.gamemode);
      setDifficulty(_room.difficulty);
      setTimePerTurn(_room.timePerTurn);
      setStartLives(_room.startLives);
      setMaxLives(_room.maxLives);
      setMaxPoints(_room.maxPoints);
      setDjIncluded(_room.djIncluded);
      const playerIndex = _room.players.findIndex(
        (_player: PlayerInterface) => _player.id === socket.id
      );
      const spectatorIndex = _room.spectators.findIndex(
        (_player: PlayerInterface) => _player.id === socket.id
      );
      if (playerIndex + spectatorIndex === -2) {
        console.log(_room);
        console.log("navigate");
        navigate("/");
      }
      const _player = _room.players[playerIndex];
      setPlayer({ ..._player });
    });
    socket.on("redirect-to-dashboard", () => {
      console.log('redirected')
      navigate("/");
    });
    socket.on("clear-input", () => {
      setWord("");
    });
    socket.on("word-error", (error) => {
      setWordError(error);
      setTimeout(() => setWordError(""), 2000);
    });

    return () => {
      socket.off("connect");
      socket.off("refresh-room");
      socket.off("refresh-player");
      socket.off("clear-input");
      socket.off("redirect-to-dashboard");
    };
    //eslint-disable-next-line
  }, [socket]);

  const getRoomCodeFromURL = () => {
    return url.pathname.substring(url.pathname.lastIndexOf("/") + 1, 10);
  };

  const handleNameChange = (e: any) => {
    setName(e.currentTarget.value);
  };

  const openNameModal = () => {
    if (process.env.NODE_ENV !== "production") {
      socket.emit("update-name", {
        playerId: socket.id,
        playerName: "test",
      });
      setDisplay(false);
    } else {
      setTimeout(() => {
        setShow(true); // account for potential timing mismatch of setLoading(false)
      }, 10);
    }
  };

  const closeNameModal = () => {
    socket.emit("update-name", {
      playerId: socket.id,
      playerName: name,
    });
    setShow(false);
    setTimeout(() => {
      setDisplay(false);
    }, 500);
  };

  const openSettingsModal = () => {
    setSettingsDisplay(true);
    setTimeout(() => {
      setSettingsShow(true);
    }, 10);
  };

  const closeSettingsModal = () => {
    socket.emit("room-settings", {
      roomCode: getRoomCodeFromURL(),
      difficulty,
      gamemode,
      timePerTurn,
      startLives,
      maxLives,
      maxPoints,
      djIncluded,
      tempo
    });

    setSettingsShow(false);
    setTimeout(() => {
      setSettingsDisplay(false);
    }, 500);
  };

  const handleKeypress = (e: any) => {
    if (e.key === "Enter" && name.length >= 3) closeNameModal();
  };

  const selectGamemode = (gamemode: string) => {
    setGamemode(gamemode);
  };
  const selectDifficulty = (difficulty: string) => {
    setDifficulty(difficulty);
  };
  const selectTempo = (tempo: string) => {
    setTempo(tempo);
  };

  const handleTimePerTurn = (e: any) => {
    setTimePerTurn(e.currentTarget.value);
  };

  const handleStartLives = (n: number) => {
    setStartLives(n);
    if (n > maxLives) setMaxLives(n);
  };

  const handleMaxLives = (n: number) => {
    setMaxLives(n);
    if (n < startLives) setStartLives(n);
  };

  const handleMaxPoints = (e: any) => {
    setMaxPoints(e.currentTarget.value);
  };

  const toggleDj = () => {
    setDjIncluded(!djIncluded);
  };

  const startGame = () => {
    socket.emit("start-game", getRoomCodeFromURL());
    setWord("");
  };

  const handleWordChange = (e: any) => {
    setWord(e.currentTarget.value);
    socket.emit("word-typing", {
      roomCode: room.code,
      playerId: player.id,
      word: e.currentTarget.value,
    });
  };
  const handleWordKeypress = (e: any) => {
    if (e.key === "Enter") {
      setTimeout(() => setWord(""), 10);
      socket.emit("submit-word", {
        roomCode: room.code,
        playerId: socket.id,
        word,
      });
    }
  };
  const getMyIndex = () => {
    return room.players.findIndex((_player) => _player.id === player.id);
  };

  return !loading ? (
    <>
      <div
        className={`${
          room.winner !== null
            ? "relative h-full flex items-center justify-center"
            : "hidden"
        }`}
      >
        <div className="flex flex-col gap-4 items-center">
          <div className="text-2xl text-white">
            <span className="font-bold">
              {room.winner ? room.winner.name.toUpperCase() : "BAKIR"}
            </span>{" "}
            je pobjednik!
          </div>
          <img
            alt="avatar"
            className="w-20 h-20"
            src={require(`../assets/avatars/${
              room.winner ? room.winner.avatarId : "1"
            }.png`)}
          ></img>
          {player.host ? (
            <Button
              onClickFunction={() => socket.emit("clear-winner", room.code)}
            >
              Nazad u sobu
            </Button>
          ) : (
            <div className="text-white italic">
              Sačekajte domaćina da vas ubaci u sobu...
            </div>
          )}
        </div>
      </div>
      <Lobby
        name={name}
        gamemode={gamemode}
        difficulty={difficulty}
        openSettingsModal={openSettingsModal}
        timePerTurn={timePerTurn}
        startLives={startLives}
        maxLives={maxLives}
        maxPoints={maxPoints}
        djIncluded={djIncluded}
        room={room}
        startGame={startGame}
        player={player}
      ></Lobby>
      <Game
        wordError={wordError}
        player={player}
        room={room}
        getMyIndex={getMyIndex}
        playersCenterDistance={playersCenterDistance}
        playersXOffset={playersXOffset}
        playersYOffset={playersYOffset}
        handleWordChange={handleWordChange}
        handleWordKeypress={handleWordKeypress}
        word={word}
      ></Game>
      <NameModal
        show={show}
        display={display}
        handleKeypress={handleKeypress}
        handleNameChange={handleNameChange}
        closeNameModal={closeNameModal}
        name={name}
      ></NameModal>
      <SettingsModal
        settingsShow={settingsShow}
        settingsDisplay={settingsDisplay}
        closeSettingsModal={closeSettingsModal}
        difficulty={difficulty}
        selectDifficulty={selectDifficulty}
        timePerTurn={timePerTurn}
        handleTimePerTurn={handleTimePerTurn}
        gamemode={gamemode}
        selectGamemode={selectGamemode}
        startLives={startLives}
        handleStartLives={handleStartLives}
        maxLives={maxLives}
        handleMaxLives={handleMaxLives}
        maxPoints={maxPoints}
        handleMaxPoints={handleMaxPoints}
        djIncluded={djIncluded}
        toggleDj={toggleDj}
        tempo={tempo}
        selectTempo={selectTempo}
      ></SettingsModal>
    </>
  ) : (
    <div className="h-full flex items-center justify-center">
      <div className="loader">Loading...</div>
    </div>
  );
};

export default Room;
