export function rectsOverlap(a, b) {
  return (
    a.top < b.bottom &&
    a.bottom > b.top &&
    a.right > b.left &&
    a.left < b.right
  );
}

export function getBirdBounds(bird) {
  return {
    top: bird.y,
    right: bird.x + bird.animatedSpray.width,
    bottom: bird.y + bird.animatedSpray.height,
    left: bird.x,
  };
}
