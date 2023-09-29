import { CheckIcon, SaveIcon, XIcon } from "@heroicons/react/outline";
import { HeartIcon } from "@heroicons/react/solid";
import { FunctionComponent } from "react";
import Button from "./button";
import { difficulties, gamemodes } from "../config/config";

interface SettingsModalProps {
  settingsShow: boolean;
  settingsDisplay: boolean;
  closeSettingsModal: () => void;
  difficulty: string;
  selectDifficulty: (s: string) => void;
  timePerTurn: number;
  handleTimePerTurn: (e: any) => void;
  gamemode: string;
  selectGamemode: (s: string) => void;
  startLives: number;
  handleStartLives: (n: number) => void;
  maxLives: number;
  handleMaxLives: (n: number) => void;
  maxPoints: number;
  handleMaxPoints: (e: any) => void;
  djIncluded: boolean;
  toggleDj: () => void;
  tempo: string;
  selectTempo: (s: string) => void;
}

const SettingsModal: FunctionComponent<SettingsModalProps> = (props) => {
  const uppercaseFirst = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <>
      <div
        className={`modal-overlay transition duration-500 absolute top-0 left-0 h-[100vh] w-full bg-black bg-opacity-70 ${
          !props.settingsShow ? "opacity-0" : "opacity-100"
        } ${!props.settingsDisplay ? "hidden" : ""}`}
      ></div>
      <div
        className={`modal z-50 text-typography transition duration-500 flex flex-col gap-2 p-4 w-11/12 max-w-[400px] bg-blank rounded absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${
          !props.settingsShow ? "opacity-0" : "opacity-100"
        } ${!props.settingsDisplay ? "hidden" : ""}`}
      >
        <div className="header-wrapper flex justify-between">
          <div className="header font-bold text-lg sm:text-xl">Postavke</div>
          <div
            className="h-6 w-6 hover:bg-slate-300 rounded cursor-pointer transition"
            onClick={props.closeSettingsModal}
          >
            <XIcon className="h-6 w-6"></XIcon>
          </div>
        </div>
        <div className="header font-semibold text-sm sm:text-lg">Odaberite način igre</div>
        <div className="gamemodes flex gap-2 w-full justify-around">
          {Object.keys(gamemodes).map((item: string, i) => (
            <div
              key={i}
              className={`gamemode text-xs sm:text-base cursor-pointer px-3 py-1 bg-slate-300 rounded transition ${
                gamemodes[item as keyof typeof gamemodes].color
              } ${props.gamemode === item ? "bg-slate-400 font-semibold" : ""}`}
              onClick={() => props.selectGamemode(item)}
            >
              {uppercaseFirst(item)}
            </div>
          ))}
        </div>
        <div className="gamemode-desc italic text-xs sm:text-sm">
          <span className="uppercase font-semibold">{props.gamemode}: </span>
          {Object.keys(gamemodes).map((item: string, i: number) =>
            item === props.gamemode ? (
              <div key={i}>
                {gamemodes[item as keyof typeof gamemodes].text}
              </div>
            ) : null
          )}
        </div>
        <hr className="border border-t-typography-light"></hr>
        <div className="header font-semibold text-sm sm:text-lg">Odaberite tempo igre</div>
        <div className="gamemodes flex gap-2 w-full justify-around">
          <div
            className={`gamemode text-xs sm:text-base cursor-pointer px-3 py-1 bg-slate-300 rounded transition ${props.tempo === 'sporo' ? "bg-slate-400" : ""}`}
            onClick={() => props.selectTempo("sporo")}
          >
            Sporo
          </div>  
          <div
            className={`gamemode text-xs sm:text-base cursor-pointer px-3 py-1 bg-slate-300 rounded transition ${props.tempo === 'blic' ? "bg-slate-400" : ""}`}
            onClick={() => props.selectTempo("blic")}
          >
            Blic
          </div>
        </div>
        <div className="slider-container">
          <div className="header font-semibold text-sm sm:text-lg">Vrijeme za potez</div>
          <input
            value={props.timePerTurn}
            className="slider"
            min="4"
            max="30"
            type="range"
            onChange={props.handleTimePerTurn}
          ></input>
          <div className="current-time italic text-xs sm:text-sm">
            Trenutno: <span className="font-bold">{props.timePerTurn}s</span>
          </div>
        </div>
        <div className="difficulty-container flex flex-col gap-2">
          <div className="header font-semibold">Težina</div>
          <div className="difficulties flex gap-2 w-full justify-around">
            {Object.keys(difficulties).map((item: string, i) => (
              <div
                key={i}
                className={`difficulty text-xs sm:text-base cursor-pointer px-3 py-1 bg-slate-300 rounded transition ${
                  difficulties[item as keyof typeof difficulties].color
                } ${
                  props.difficulty === item ? "bg-slate-400 font-semibold" : ""
                }`}
                onClick={() => props.selectDifficulty(item)}
              >
                {uppercaseFirst(item)}
              </div>
            ))}
          </div>
          <div className="difficulty-desc italic text-xs sm:text-sm">
            <span className="uppercase font-semibold">
              {props.difficulty}:{" "}
            </span>
            {Object.keys(difficulties).map((item: string, i: number) =>
              item === props.difficulty ? (
                <div key={i}>
                  {difficulties[item as keyof typeof difficulties].text}
                </div>
              ) : null
            )}
          </div>
        </div>
        <hr className="border border-t-typography-light"></hr>
        <div
          className={`opstanak-setting ${
            props.gamemode !== "opstanak" ? "hidden" : ""
          }`}
        >
          <div className="header font-semibold text-sm sm:text-lg">OPSTANAK - Životi</div>
          <div className="start-lives-wrapper flex justify-between gap-2">
            <div className="start-lives-text text-sm sm:text-base">
              Početni životi:
            </div>
            <div className="start-lives flex gap-0.25">
              {[...Array(7)].map((item, i) => (
                <HeartIcon
                  className={`h-6 w-6 cursor-pointer text-red-600 ${
                    i < props.startLives ? "opacity-100" : "opacity-30"
                  }`}
                  onClick={() => props.handleStartLives(i + 1)}
                  key={i}
                ></HeartIcon>
              ))}
            </div>
          </div>
          <div className="start-lives-wrapper flex justify-between gap-2">
            <div className="start-lives-text text-sm sm:text-base">
              Maksimalni životi:
            </div>
            <div className="max-lives flex gap-0.25">
              {[...Array(7)].map((item, i) => (
                <HeartIcon
                  className={`h-6 w-6 cursor-pointer text-fuchsia-600 ${
                    i < props.maxLives ? "opacity-100" : "opacity-30"
                  }`}
                  onClick={() => props.handleMaxLives(i + 1)}
                  key={i}
                ></HeartIcon>
              ))}
            </div>
          </div>
          <div className="current-time italic text-xs sm:text-sm">
            Trenutno:{" "}
            <span className="font-bold">
              {props.startLives} poč.{" "}
              {props.startLives === 1 ? "život" : "života"}, {props.maxLives}{" "}
              maks. {props.maxLives === 1 ? "život" : "života"}
            </span>
          </div>
        </div>
        <div
          className={`rjecitost-setting ${
            props.gamemode !== "kolekcionar" ? "hidden" : ""
          }`}
        >
          <div className="header font-semibold">
            KOLEKCIONAR - bodovi za pobjedu
          </div>
          <input
            value={props.maxPoints}
            className="slider"
            min="100"
            max="3000"
            step="100"
            type="range"
            onChange={props.handleMaxPoints}
          ></input>
          <div className="current-time italic text-xs sm:text-sm">
            Trenutno:{" "}
            <span className="font-bold">{props.maxPoints} bodova</span>
          </div>
        </div>
        <div
          className={`alfabet-setting mb-4 ${
            props.gamemode !== "alfabet" ? "hidden" : ""
          }`}
        >
          <div className="header font-semibold mb-0.5">ALFABET - Slovo "Đ"</div>
          <div className="flex items-center gap-2">
            <div
              className={`checkbox transition border-2 flex items-center justify-center w-5 h-5 rounded cursor-pointer ${
                props.djIncluded
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-typography-light"
              }`}
              onClick={props.toggleDj}
            >
              <CheckIcon
                className={`h-4 w-4 transition ${
                  !props.djIncluded ? "opacity-0" : "opacity-100"
                }`}
              ></CheckIcon>
            </div>
            <div className="text-sm sm:text-base">
              Uključi slovo "Đ" u abecedu
            </div>
          </div>
        </div>
        <Button onClickFunction={props.closeSettingsModal}>
          <SaveIcon className="h-4 w-4"></SaveIcon>Sačuvaj
        </Button>
      </div>
    </>
  );
};

export default SettingsModal;
