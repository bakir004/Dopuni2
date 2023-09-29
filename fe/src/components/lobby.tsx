import {
  BeakerIcon,
  CheckIcon,
  ClockIcon,
  DatabaseIcon,
  DuplicateIcon,
  FireIcon,
  LightningBoltIcon,
  XIcon,
} from "@heroicons/react/outline";
import { HeartIcon, CogIcon, FlagIcon } from "@heroicons/react/solid";
import { FunctionComponent } from "react";
import {
  difficulties,
  gamemodes,
  PlayerInterface,
  RoomInterface,
} from "../config/config";
import Button from "./button";
import Player from "./player";

interface LobbyProps {
  gamemode: string;
  timePerTurn: number;
  difficulty: string;
  openSettingsModal: () => void;
  name: string;
  startLives: number;
  maxLives: number;
  maxPoints: number;
  djIncluded: boolean;
  startGame: () => void;
  room: RoomInterface;
  player: PlayerInterface;
}

const Lobby: FunctionComponent<LobbyProps> = (props) => {
  const uppercaseFirst = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <span className={`${props.room.gameRunning || props.room.winner !== null ? "hidden" : ""}`}>
      <div className="mt-14 sm:mt-20 hidden xs:block mb-4 w-fit mx-auto text-white">
        <span>Kod: </span>
        <span className=" text-4xl font-bold text-white">
          {props.room.code}
        </span>
      </div>
      <div className="content p-2 xs:p-4 text-typography mt-16 xs:mt-0 min-w-[250px] w-11/12 max-w-[600px] bg-blank bg-opacity-90 mx-auto rounded">
        <div className="lobby-content">
          <div className="room-info-container">
            <div className="font-semibold flex justify-between items-center text-lg mb-2">
              <span>Soba</span>
              <span className="xs:hidden flex items-center gap-1">
                Kod: {props.room.code}
                <DuplicateIcon
                  className="h-5 w-5 cursor-pointer"
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.href)
                  }
                ></DuplicateIcon>
              </span>
            </div>
            <div className="room-info flex flex-wrap gap-3 mb-2">
              <span className="flex gap-3">
                <div
                  className={`room-property flex gap-1 items-center ${
                    gamemodes[props.room.gamemode as keyof typeof gamemodes]
                      .color
                  }`}
                >
                  <BeakerIcon className="h-4 w-4"></BeakerIcon>
                  <span>{uppercaseFirst(props.room.gamemode)}</span>
                </div>
                <span>|</span>
              </span>
              <span className="flex gap-3">
                <div className="room-property flex gap-1 items-center">
                  <ClockIcon className="h-4 w-4"></ClockIcon>
                  <span className="font-semibold">
                    {props.room.timePerTurn}s
                  </span>
                </div>
                <span>|</span>
              </span>
              <span className="flex gap-3">
                <div
                  className={`room-property flex gap-1 items-center ${
                    difficulties[
                      props.room.difficulty as keyof typeof difficulties
                    ].color
                  }`}
                >
                  <FireIcon className="h-4 w-4"></FireIcon>
                  <span>{uppercaseFirst(props.room.difficulty)}</span>
                </div>
                <span>|</span>
              </span>
              <span className="flex gap-3">
                <div
                  className={`room-property flex gap-1 items-center ${
                    difficulties[
                      props.room.difficulty as keyof typeof difficulties
                    ].color
                  }`}
                >
                  <LightningBoltIcon className="h-4 w-4"></LightningBoltIcon>
                  <span>{uppercaseFirst(props.room.tempo)}</span>
                </div>
                <span>|</span>
              </span>
              <span className="flex gap-3">
                <div className={`room-property flex gap-1 items-center`}>
                  <span
                    className={`flex gap-2 items-center ${
                      props.room.gamemode !== "opstanak" ? "hidden" : ""
                    }`}
                  >
                    <span className="text-red-600 flex items-center gap-0.5">
                      {props.room.startLives}{" "}
                      <HeartIcon className="w-4 h-4 "></HeartIcon>
                    </span>
                    <span className="text-fuchsia-600 flex items-center gap-0.5">
                      {props.room.maxLives}{" "}
                      <HeartIcon className="w-4 h-4 "></HeartIcon>
                    </span>
                  </span>
                  <span
                    className={`flex gap-2 items-center ${
                      props.room.gamemode !== "kolekcionar" ? "hidden" : ""
                    }`}
                  >
                    <span className="text-blue-600 flex items-center gap-0.5">
                      {props.room.maxPoints}{" "}
                      <DatabaseIcon className="w-4 h-4 "></DatabaseIcon>
                    </span>
                  </span>
                  <span
                    className={`flex gap-2 items-center ${
                      props.room.gamemode !== "alfabet" ? "hidden" : ""
                    }`}
                  >
                    <span className="text-purple-700 flex items-center gap-0.5">
                      {props.room.djIncluded ? (
                        <CheckIcon className="h-4 w-4"></CheckIcon>
                      ) : (
                        <XIcon className="h-4 w-4"></XIcon>
                      )}
                      <span>Đ</span>
                    </span>
                  </span>
                </div>
                <span>|</span>
              </span>
              <span
                className={`postavke bg-sky-600 hover:bg-sky-500 transition text-white px-2 font-semibold flex gap-1 rounded items-center cursor-pointer ${
                  !props.player.host ? "hidden" : ""
                }`}
                onClick={props.openSettingsModal}
              >
                <span>Postavke</span>
                <CogIcon className="w-4 h-4"></CogIcon>
              </span>
            </div>
          </div>
          <div className="players-container mb-4 mt-2">
            <div className="header-wrapper flex gap-4 items-center mb-4">
              <div className="players-header w-fit whitespace-nowrap font-semibold text-lg">
                Igrači: {props.room.players.length}/8
              </div>
              <hr className="w-full border-t border-typography-light"></hr>
            </div>
            <div className="players-list flex gap-2 flex-wrap">
              {props.room.players.map((_player: PlayerInterface, i) => (
                <Player
                  key={i}
                  env="lobby"
                  player={_player}
                  me={_player.id === props.player.id}
                >
                  {_player.name}
                </Player>
              ))}
            </div>
          </div>
          <div
            className={`actions flex justify-end ${
              !props.player.host ? "hidden" : ""
            }`}
          >
            <Button
              onClickFunction={props.startGame}
              disabled={props.room.players.length <= 1}
            >
              <FlagIcon className="h-4 w-4"></FlagIcon>Počni igru
            </Button>
          </div>
        </div>
      </div>
    </span>
  );
};

export default Lobby;
