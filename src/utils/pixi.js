import { markRaw } from 'vue';
import * as PIXI from 'pixi.js';

export async function initPixiApp(container, width, height) {
  const app = markRaw(new PIXI.Application());
  await app.init({
    backgroundAlpha: 0,
    width,
    height,
  });
  container.appendChild(app.canvas);
  return app;
}

export function createSprite(url) {
  const texture = markRaw(PIXI.Texture.from(url));
  const sprite = markRaw(new PIXI.Sprite(texture));
  return { texture, sprite };
}

export function createTilingSprite(url, width, height) {
  const texture = markRaw(PIXI.Texture.from(url));
  const sprite = markRaw(new PIXI.TilingSprite({ texture, width, height }));
  return { texture, sprite };
}

export function createText(text, style) {
  return markRaw(new PIXI.Text({
    text,
    style: new PIXI.TextStyle(style),
  }));
}

export function createAnimatedSprite(imageUrls) {
  const textures = imageUrls.map((url) => markRaw(PIXI.Texture.from(url)));
  const sprite = markRaw(new PIXI.AnimatedSprite(textures));
  return { textures, sprite };
}

export function destroyApp(app) {
  if (app) {
    app.destroy(true, { children: true, texture: true });
  }
}
