import { PlayerInterface, RoomInterface } from "./models/interfaces";

export const createRoom = (code: string) => {
  const room = {
    code,
    tempo: "blic",
    gamemode: "opstanak",
    difficulty: "lahko",
    timePerTurn: 25,
    startLives: 3,
    maxLives: 5,
    maxPoints: 300,
    djIncluded: false,
    players: [],
    spectators: [],
    gameRunning: false,
    playerTurn: -1,
    timer: 999999,
    usedAvatarIds: [],
    winner: null,
    combination: '',
    usedWords: []
  } as RoomInterface;
  return room;
};

const letters = {
  A: false,
  B: false,
  C: false,
  Č: false,
  Ć: false,
  D: false,
  Đ: false,
  E: false,
  F: false,
  G: false,
  H: false,
  I: false,
  J: false,
  K: false,
  L: false,
  M: false,
  N: false,
  O: false,
  P: false,
  R: false,
  S: false,
  Š: false,
  T: false,
  U: false,
  V: false,
  Z: false,
  Ž: false,
}

export const createPlayer = (id: string, name: string) => {
  const player = {
    id: id,
    name: name,
    avatarId: -1,
    word: "",
    lives: -1,
    points: -1,
    letters: {...letters},
    host: false,
    room: "",
    connected: false,
    done: false
  } as PlayerInterface;
  return player;
};
