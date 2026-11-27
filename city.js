'use strict';
const canvas = document.querySelector('#city');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const zoomButton = document.querySelector('#zoom');
const background = new Image();
const hero = new Image();
background.src = 'story/maps/fortified-city.webp';
hero.src = 'wk_tank.webp';

const road = new Path2D();
// Coordinates follow the visible pavement in the 1536 × 1024 town image.
road.addPath(new Path2D('M 0 414 L 149 419 L 164 398 L 238 391 L 262 359 L 314 339 L 341 347 L 355 369 L 320 379 L 284 400 L 268 430 L 267 461 L 279 491 L 309 511 L 377 515 L 433 504 L 455 473 L 454 414 L 526 407 L 622 394 L 636 373 L 636 312 L 746 312 L 740 377 L 756 392 L 1338 391 L 1360 423 L 1536 423 L 1536 466 L 1353 466 L 1334 489 L 762 491 L 727 507 L 719 539 L 723 731 L 749 750 L 1320 750 L 1320 770 L 754 775 L 751 792 L 737 800 L 735 1024 L 658 1024 L 658 795 L 641 773 L 197 773 L 197 747 L 632 746 L 649 724 L 649 533 L 634 510 L 601 495 L 533 494 L 510 526 L 465 550 L 393 563 L 351 552 L 278 551 L 245 531 L 216 476 L 190 458 L 143 457 L 0 449 Z'));
road.addPath(new Path2D('M 226 407 L 233 350 L 260 322 L 259 298 L 282 298 L 285 325 L 263 354 L 257 408 Z'));
road.addPath(new Path2D('M 333 388 L 332 276 L 356 276 L 359 387 Z M 833 396 L 833 283 L 854 283 L 861 396 Z M 987 396 L 987 326 L 1038 326 L 1038 396 Z M 409 758 L 409 568 L 436 568 L 439 758 Z M 535 753 L 535 700 L 568 700 L 568 753 Z M 817 758 L 817 697 L 848 697 L 848 758 Z M 1044 757 L 1044 692 L 1074 692 L 1074 757 Z M 1217 757 L 1217 675 L 1245 675 L 1245 757 Z M 207 756 L 207 727 L 236 727 L 236 756 Z'));

const pressed = new Set();
const position = { x:685, y:460, facing:0, stride:0 };
const initialMessage = status.textContent;
let zoomed = false;
let lastTime = 0;
const vectors = {
  ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0],
  ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1],
};
function canMove(x,y) {
  return x > 5 && x < 1531 && y > 5 && y < 1019
    && [[0,0],[-5,0],[5,0],[0,-4],[0,4]].every(([dx,dy]) => ctx.isPointInPath(road,x+dx,y+dy));
}
function update(delta) {
  let x = 0, y = 0;
  for (const key of pressed) {
    x += vectors[key][0];
    y += vectors[key][1];
  }
  const length = Math.hypot(x,y);
  if (!length) return false;
  position.facing = Math.abs(x) >= Math.abs(y) ? (x < 0 ? 1 : 2) : (y < 0 ? 3 : 0);
  const dx = x / length * delta * 205;
  const dy = y / length * delta * 205;
  const oldX = position.x, oldY = position.y;
  if (canMove(position.x+dx,position.y)) position.x += dx;
  if (canMove(position.x,position.y+dy)) position.y += dy;
  const exit = position.x < 26 ? '서쪽 숲길' : position.x > 1508 ? '동쪽 나무다리' : position.y > 992 ? '남쪽 성문' : '';
  const message = exit ? exit + ' 출구에 도착했습니다.' : initialMessage;
  if (status.textContent !== message) status.textContent = message;
  const moved = Math.hypot(position.x-oldX, position.y-oldY);
  position.stride += moved;
  return moved > 0;
}
function draw(time) {
  const delta = lastTime ? Math.min(0.034, (time-lastTime)/1000) : 0;
  lastTime = time;
  const moving = update(delta);
  const {x,y,facing,stride} = position;
  const scale = zoomed ? 2 : 1;
  const left = Math.min(1536-1536/scale,Math.max(0,x-768/scale));
  const top = Math.min(1024-1024/scale,Math.max(0,y-512/scale));
  if (background.complete && background.naturalWidth) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(background,left,top,1536/scale,1024/scale,0,0,1536,1024);
  }
  const sx = (x-left)*scale, sy = (y-top)*scale;
  if (hero.complete && hero.naturalWidth) {
    const frame = moving ? Math.floor(stride/18)%4 : 0;
    ctx.drawImage(hero,frame*128,facing*128,128,128,sx-32*scale,sy-56*scale,64*scale,64*scale);
  }
  requestAnimationFrame(draw);
}
for (const button of document.querySelectorAll('[data-key]')) {
  const key = button.dataset.key;
  button.onpointerdown = event => {
    button.setPointerCapture(event.pointerId);
    pressed.add(key);
  };
  button.onlostpointercapture = () => pressed.delete(key);
}
window.addEventListener('keydown',event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (!(key in vectors)) return;
  event.preventDefault();
  pressed.add(key);
});
window.addEventListener('keyup',event => pressed.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
window.addEventListener('blur',() => pressed.clear());
zoomButton.onclick = () => {
  zoomed = !zoomed;
  zoomButton.textContent = zoomed ? '전체 보기' : '확대';
  zoomButton.setAttribute('aria-pressed',String(zoomed));
};
requestAnimationFrame(draw);
