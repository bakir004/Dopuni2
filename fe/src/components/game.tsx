import { FunctionComponent, useRef, useContext, useEffect } from "react";
import { PlayerInterface, RoomInterface } from "../config/config";
import { SocketContext } from "../socket";
import Player from "./player";

interface GameProps {
  room: RoomInterface;
  getMyIndex: () => number;
  handleWordKeypress: (e: any) => void;
  handleWordChange: (e: any) => void;
  playersCenterDistance: number;
  playersXOffset: number;
  playersYOffset: number;
  word: string;
  player: PlayerInterface;
  wordError: string
}

const Game: FunctionComponent<GameProps> = (props) => {
  const ref = useRef<any>(null);
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("refresh-room", (_room: RoomInterface) => {
      setTimeout(() => {
        ref.current && ref.current.focus();
      }, 50);
    });
    socket.on("words", (wordList) => {
      console.log(wordList);
    });
    return () => {
      socket.off('words')
    }
  }, [socket]);

  useEffect(() => {
    console.log(props.player)
    setTimeout(() => {
      ref.current && ref.current.focus();
    }, 50);
  }, []);

  return (
    <div
      className={`game relative h-full flex items-center justify-center ${
        props.room.gameRunning && props.room.winner === null ? "" : "hidden"
      }`}
    >
      <img
        alt="arrow"
        src={require("../assets/arrow6.png")}
        className={`transition duration-500 h-20 sm:h-[150px] ${props.room.tempo === 'blic' ? "hidden":""}`}
        style={{
          transform:
            "rotate(" +
            (-6.28 / props.room.players.length) * props.room.playerTurn +
            "rad)",
        }}
      ></img>
      <img
        alt="bomb"
        src={require("../assets/bomba.png")}
        className={`transition absolute h-16 sm:h-[104px]`}
      ></img>
      <div
        className={`h-[44px] w-[44px] sm:h-[68px] sm:w-[68px] rounded-full absolute -z-10`}
        style={{
          background:
            `conic-gradient(${
              props.room.timer / props.room.timePerTurn > 0.66
                ? "#22C55E"
                : props.room.timer / props.room.timePerTurn > 0.33
                ? "#FBBF24"
                : "#EF4444"
            } ` +
            (props.room.timer / props.room.timePerTurn) * 360 +
            "deg, transparent " +
            ((props.room.timer / props.room.timePerTurn) * 360 + 1) +
            "deg)",
        }}
      ></div>
      <div className={`absolute w-full h-16 ${!props.wordError ? "opacity-0" : "opacity-100"}`}>
        <div className="relative">
          <div className="absolute top-16 sm:top-20 w-full text-center text-rose-300 text-sm sm:text-lg font-semibold">{props.wordError}</div>
        </div>
      </div>
      <div className="letters absolute bottom-20 sm:left-4 sm:top-20 flex justify-center sm:justify-start sm:flex-col gap-1 w-[95%] sm:w-[50px] sm:h-1/2 flex-wrap text-white font-semibold">
        {props.player.letters ? Object.keys(props.player.letters).map((item, i) =>
          !props.room.djIncluded ? (
            item !== "Đ" ? (
              <div
                key={i}
                className={`text-sm sm:text-base flex items-center justify-center bg-sky-600 rounded w-4 h-4 sm:w-5 sm:h-5 ${
                  props.player.letters[
                    item as keyof typeof props.player.letters
                  ]
                    ? "opacity-30"
                    : "opacity-100"
                }`}
              >
                {item}
              </div>
            ) : null
          ) : (
            <div
              key={i}
              className={`text-sm sm:text-base flex items-center justify-center bg-sky-600 rounded w-4 h-4 sm:w-5 sm:h-5 ${
                props.player.letters[item as keyof typeof props.player.letters]
                  ? "opacity-30"
                  : "opacity-100"
              }`}
            >
              {item}
            </div>
          )
        ): null}
      </div>
      <div
        className={`input absolute bottom-4 ${
          props.room.tempo === 'sporo' ? props.room.playerTurn % props.room.players.length ===
          props.getMyIndex()
            ? "flex"
            : "hidden" : !props.player.done ? "flex" : "hidden"
        } justify-center w-full h-12 sm:h-16`}
      >
        <div className="rotating">
          <input
            ref={ref}
            autoFocus
            value={props.word}
            maxLength={30}
            onKeyDown={(e) => props.handleWordKeypress(e)}
            onChange={(e) => props.handleWordChange(e)}
            className="rotating-overlay outline-none text-center text-lg sm:text-3xl uppercase text-white"
            placeholder="upišite svoju riječ ovdje"
          ></input>
        </div>
      </div>
      <div className="center absolute flex justify-center items-center top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-16 h-16 rounded-full">
        <div className="relative flex items-center justify-center w-12 h-12">
          {props.room.players.map((_player, i) => (
            <Player
              includeDjInCount={props.room.djIncluded}
              gamemode={props.room.gamemode}
              player={_player}
              key={i}
              xPosition={
                props.playersCenterDistance *
                  Math.cos((6.28 / props.room.players.length) * i) +
                props.playersXOffset
              }
              yPosition={
                props.playersCenterDistance *
                  Math.sin((6.28 / props.room.players.length) * i) +
                props.playersYOffset
              }
            >
              Player
            </Player>
          ))}
          <span
            className={`text-md sm:text-2xl uppercase font-semibold text-white`}
          >
            {props.room.combination}
          </span>
        </div>

        {/* <img src={require('../assets/bomb3.png')} className="w-20 h-20"></img> */}
      </div>
    </div>
  );
};

export default Game;
