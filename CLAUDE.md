# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flappy Bird clone built with Vue 3 + Pixi.js v6. The game renders via Pixi.js canvas inside Vue components, with Vue Router for screen navigation and Vuex for state (high score tracking via localStorage).

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build
- Deploy: Firebase Hosting (`firebase deploy`), serves from `dist/`

No tests or linter configured.

## Architecture

- **Vite** bundler with `@` alias resolving to `./src`
- **Vue Router** (history mode): `/` (home), `/game` (gameplay), `/game-over` (end screen)
- **Vuex store** (`src/store/store.js`): tracks `record` (high score), persists to localStorage
- **Game engine** (`src/views/AppGame.vue`): all Pixi.js game logic lives in a single Vue component — bird physics, pipe spawning, collision detection, scoring, input handling (click/touch/keyboard)
- **App.vue**: root component with route transitions (fade) and ticker text component
- **Sprites**: bird animation frames in `src/assets/img/drags/`, other game assets in `src/assets/img/`
- **Styles**: SCSS with custom font (FB.woff) in `src/assets/scss/`

## Key Details

- Game canvas is fixed 225x400px
- Bird uses `PIXI.AnimatedSprite` with 3 frame textures
- Pipes use `PIXI.Sprite`, ground/background use `PIXI.TilingSprite`
- Collision detection is AABB-based (top pipe, bottom pipe, ground)
- Input: ArrowUp/Space keys + click + touch
- Comments in source are in Russian/Ukrainian
