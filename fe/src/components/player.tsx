import {
  AtSymbolIcon,
  DatabaseIcon,
  StatusOfflineIcon,
  XIcon,
} from "@heroicons/react/outline";
import { HeartIcon } from "@heroicons/react/solid";
import { FunctionComponent } from "react";
import { PlayerInterface } from "../config/config";

interface PlayerProps {
  children: string;
  env?: string;
  xPosition?: number;
  yPosition?: number;
  player: PlayerInterface;
  me?: boolean;
  gamemode?: string;
  includeDjInCount?: boolean;
}

const Player: FunctionComponent<PlayerProps> = (props) => {
  return props.env === "lobby" ? (
    <div className="player flex flex-col gap-2 items-center flex-grow basis-1/5">
      <img
        alt="avatar"
        src={
          props.player.host
            ? require(`../assets/avatarhosts/${props.player.avatarId}.png`)
            : require(`../assets/avatars/${props.player.avatarId}.png`)
        }
        className="player-icon h-10 w-10 sm:w-12 sm:h-12"
      ></img>
      <div
        // style={{ fontSize: 20 + (1 / (props.children.length + 1)) * 7 }}
        className={`player-name font-devant text-sm xs:text-base sm:text-xl tracking-wide uppercase ${
          !props.me ? "bg-typography-dark" : "bg-green-500"
        } text-white rounded py-1 px-2 w-[70px] xs:w-[85px] sm:w-[100px] break-words h-5 sm:h-7 flex items-center justify-center gap-0.25`}
      >
        {props.children}
        {/* {props.player.host ? <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"></StarIcon> : null} */}
      </div>
    </div>
  ) : (
    <div
      className="w-16 h-fit absolute flex flex-col items-center"
      style={{
        bottom: props.yPosition,
        left: props.xPosition,
      }}
    >
      <div
        className={`name ${
          !props.player.connected ? "line-through opacity-50" : ""
        } font-devant tracking-wide whitespace-nowrap flex items-center gap-1 text-md xs:tracking-normal xs:text-xl text-center uppercase text-white -mb-1`}
      >
        {props.player.name}
        {!props.player.connected ? (
          <StatusOfflineIcon className="w-4 h-4"></StatusOfflineIcon>
        ) : null}
      </div>
      {/* TODO: scale size with number of hearts*/}
      {props.gamemode === "opstanak" ? (
        <div className="status text-red-600 flex justify-center">
          {props.player.lives > 0 ? (
            [...Array(props.player.lives)].map((life, i) => (
              <HeartIcon key={i} className="w-4 h-4 sm:w-5 sm:h-5"></HeartIcon>
            ))
          ) : (
            <XIcon className="w-4 h-4 sm:w-5 sm:h-5"></XIcon>
          )}
        </div>
      ) : props.gamemode === "kolekcionar" ? (
        <div className="flex items-center text-yellow-400">
          <span className="">{props.player.points}</span>
          <DatabaseIcon className="h-3 w-3 sm:w-4 sm:h-4"></DatabaseIcon>
        </div>
      ) : (
        <div className="flex items-center text-emerald-300">
          <AtSymbolIcon className="h-3 w-3 sm:w-4 sm:h-4"></AtSymbolIcon>
          <span className="">
            {
              Object.keys(props.player.letters).filter(
                (letter) =>
                  !props.player.letters[
                    letter as keyof typeof props.player.letters
                  ]
              ).length + (props.includeDjInCount && !props.player.letters["Đ"] ? 1 : 0)
            }
          </span>
        </div>
      )}
      <img 
        alt="avatar"
        src={require(`../assets/avatars/${props.player.avatarId}.png`)}
        className="avatar w-6 h-6 xs:w-8 xs:h-8 sm:h-10 sm:w-10"
      ></img>
      <div className="word text-white text-xs xs:text-sm sm:text-base uppercase whitespace-nowrap">
        {props.player.word.length > 0 ? <span className={`${props.player.done ? "text-emerald-300 font-bold" : ""}`}>{props.player.word}</span> : <span>&nbsp;</span>}
      </div>
    </div>
  );
};

export default Player;
