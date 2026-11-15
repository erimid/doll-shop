# doll-shop

Doll Shop Survivors: a creepy arena survival game for iPad Safari. You are locked in a toy store overnight, the dolls wake up when you get close, and you have to last until dawn.

Play it at https://erimid.github.io/doll-shop/ once GitHub Pages is enabled for this repository (Settings, Pages, deploy from the `main` branch, root folder).

## What is in the game

- Three shifts: Closing Shift (5 minutes), Graveyard Shift (15 minutes, five minibosses) and Endless Nightmare.
- A store made of nine rooms that each look and play differently. Seven of them hide a miniboss lair with a golden gift.
- 13 kinds of doll, 7 minibosses and Madame Porcelain. Dolls look sweet on the shelf and hollow-eyed once they wake up.
- 17 weapons that each evolve, plus 24 passive items. A build holds 6 weapons, 4 power items, 3 defense items and 3 support items.
- Style sets: collecting items of one kind (Makeup, Outfit, Charm, Pet, Toy) gives a set bonus, so themed builds pay off.
- 8 playable girls with different starting weapons and perks.
- Dares: optional hard-mode toggles (Lights Out, Sugar Rush, Black Friday, Glass Heart) that pay extra buttons.
- Buttons earned every night buy permanent power-ups, new items and new characters in the Toy Chest. Stickers (achievements) pay out extra buttons and unlock shifts and characters.
- Scares: flickering lights, shelf dolls that watch you walk past, whispers, and a face at the edge of the dark.
- Three synthesized toy songs that rotate during a night.

Progress is saved in the browser's local storage.

## Building

- `index.html` is the whole game in one self-contained file (Canvas 2D, procedural art, WebAudio synth).
- Sources live in `src/`. Run `python3 build.py` to rebuild `index.html`.
