export const gamemodes = {
  opstanak: {
    text: "Igrate dok svi osim jednog ispadnu iz igre. Iskorištavanjem svih slova igrač dobija život.",
    color: "text-red-700",
  },
  kolekcionar: {
    text: "Igrate na bodove. Više bodova dobija onaj sa dužim riječima. Prvi igrač koji osvoji određen broj bodova pobjeđuje. Iskorištavanjem svih slova igrač dobija dodatne bodove.",
    color: "text-blue-700",
  },
  alfabet: {
    text: "Pobjeđuje igrač koji prvi iskoristi sva slova u bosanskoj abecedi (osim 'đ').",
    color: "text-purple-700",
  },
};

export const difficulties = {
  lahko: {
    text: "Kombinacija slova se sadrži u minimalno 500 riječi.",
    color: "text-blue-700",
  },
  srednje: {
    text: "Kombinacija slova se sadrži u 250 do 500 riječi.",
    color: "text-amber-500",
  },
  teško: {
    text: "Kombinacija slova se sadrži u 50 do 250 riječi.",
    color: "text-red-700",
  },
};

export const alphabet = "ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ";

export interface LettersInterface {
  A: boolean;
  B: boolean;
  C: boolean;
  Č: boolean;
  Ć: boolean;
  D: boolean;
  Đ: boolean;
  E: boolean;
  F: boolean;
  G: boolean;
  H: boolean;
  I: boolean;
  J: boolean;
  K: boolean;
  L: boolean;
  M: boolean;
  N: boolean;
  O: boolean;
  P: boolean;
  R: boolean;
  S: boolean;
  Š: boolean;
  T: boolean;
  U: boolean;
  V: boolean;
  Z: boolean;
  Ž: boolean;
}

export interface PlayerInterface {
  id: string;
  name: string;
  avatarId: number;
  word: string;
  lives: number;
  points: number;
  letters: LettersInterface;
  room: string;
  host: boolean;
  connected: boolean;
  done: boolean
}

export interface RoomInterface {
  code: string;
  tempo: string;
  gamemode: string;
  difficulty: string;
  timePerTurn: number;
  startLives: number;
  maxLives: number;
  maxPoints: number;
  djIncluded: boolean;
  players: Array<PlayerInterface>;
  spectators: Array<PlayerInterface>;
  gameRunning: boolean;
  playerTurn: number;
  timer: number,
  usedAvatarIds: Array<number>,
  winner: PlayerInterface | null,
  combination: string,
  usedWords: Array<string>
}

export const letters = {
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

export const blankRoom = {
  code: "",
  tempo: "blic",
  gamemode: "opstanak",
  difficulty: "lahko",
  timePerTurn: -1,
  startLives: -1,
  maxLives: -1,
  maxPoints: -1,
  djIncluded: false,
  players: [],
  spectators: [],
  gameRunning: false,
  playerTurn: -1,
  timer: -1,
  usedAvatarIds: [],
  winner: null,
  combination: '',
  usedWords: []
};

export const blankPlayer = {
  id: "",
  name: "",
  avatarId: -1,
  word: "",
  lives: -1,
  points: -1,
  letters: {...letters},
  host: false,
  room: "",
  done: false,
  connected: false
};
