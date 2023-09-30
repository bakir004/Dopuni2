# Dopuni.ba

Discovering the simplicity of Socket.io made me think of its use.
The first thought was making a multiplayer game for me and my friends.

### Tech Stack

Frontend: React with TypeScript, TailwindCSS

Backend: NodeJS, Socket.io

Database: -

### Game Premise

The players sit in a circle and are each given a combination of 2 or 3 letters. Their task is to come up with a Bosnian word that contains the given combination somewhere in the word. It's important to note that the user's word contains the letter combination as a substring. For example, if the given combination is "SLO", then the acceptable words (among others) are: "slovo", "poslodavac" or "maslo".
Each player has a time limit inside which they must write the word. If they do not write the word on time, their turn will be skipped (in Survival mode they lose a life). Words that have already been written during the game cannot be re-used.

Though a requirement for this project is a list of all possible Bosnian words, I knew that that was not possible.
The best I could do at the time was just pulling all the words from a dictionary and leave out the noun cases and other word variations.
After desperately trying to get access to the largest Bosnian dictionary at the time, I had to settle with a scanned dictionary I found online. The problem arose when the conversion from scanned .pdf to .txt started making mistakes and reading the special Bosnian characters as something else, so many words are missing from the game (which is the only reason I get yelled at when playing with friends).

### Gamemodes

There are three gamemodes: Survival, Collector and Alphabet.

In Alphabet, the win condition is to use all the words inside the Bosnian alphabet at least once in the words used throughout the game. In the settings, the host can choose whether or not the letter 'Đ' will be included in the required letters. This is an option because this letter is very rare to appear in the most common words, especially when included in a letter combination. This gamemode is considered to be the most popular and most fun because of its short duration.

In Collector, the win condition is to collect a set amount of points that the host sets before the game begins. Each letter in a word that is accepted when playing is scored with 3 points. This mode also rewards you with extra points when all Bosnian letters in the alphabet are used, after which the letters used are reset. This gamemode forces the player to write the longest words he can think of that contain the given combination.

In Survival, all the players have a set amount of lives at the beginning of the game. Not writing a word on time reduces the number of lives by 1. If a player runs out of lives, he is disqualified and must wait until the remaining players finish. When there is only one player left, the game ends with the remaining player as the winner. The players can use all the letters in the Bosnian alphabet like in the previous gamemodes to get an extra life, but cannot get more lives than the host set in the settings. This gamemode can make the match take very long to end, especially if the players are good.

### Game Tempo

There are two game tempos in Dopuni.ba: Turn-based and Blitz. Turn-based makes players take turns when writing words. Blitz makes all players write words for the same combination of letters at the same time. Blitz forces the players to be more creative with their words because the most common ones will already be taken by the other players.
