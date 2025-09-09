// NYC Climate Week 2025 — GPU growth around text (p5.js + WebGL + GLSL)
// Keys: S = save PNG, R = reseed

let pgText, growA, growB, updateShader, blitShader;
let t = 0;
let W, H;

function preload() {
  updateShader = loadShader('pass.vert', 'update.frag');
  blitShader   = loadShader('pass.vert', 'blit.frag');
}

function setup() {
  // Fit to window & handle retina
  W = windowWidth;
  H = windowHeight;
  const cnv = createCanvas(W, H, WEBGL);
  noStroke();

  // Text mask drawn in 2D
  pgText = createGraphics(W, H);
  pgText.pixelDensity(1);
  drawTextMask(pgText);

  // Ping-pong buffers
  growA = createGraphics(W, H, WEBGL);
  growB = createGraphics(W, H, WEBGL);
  clearBuffer(growA);
  clearBuffer(growB);
}

function draw() {
  t += deltaTime / 1000;

  // UPDATE pass
  growB.shader(updateShader);
  updateShader.setUniform('u_prev', growA);
  updateShader.setUniform('u_text', pgText);
  updateShader.setUniform('u_time', t);
  updateShader.setUniform('u_resolution', [W, H]);
  updateShader.setUniform('u_decay', 0.985);      // trail persistence
  updateShader.setUniform('u_gain', 0.03);        // growth intensity
  updateShader.setUniform('u_fieldScale', 0.002); // noise scale
  updateShader.setUniform('u_timeScale', 0.15);   // noise animation
  updateShader.setUniform('u_avoid', 0.85);       // text repulsion
  growB.rect(0, 0, 1, 1);

  // swap
  [growA, growB] = [growB, growA];

  // DISPLAY
  background(8, 12, 10);
  texture(growA);
  beginShape();
  vertex(-W/2, -H/2, 0, 0);
  vertex( W/2, -H/2, 1, 0);
  vertex( W/2,  H/2, 1, 1);
  vertex(-W/2,  H/2, 0, 1);
  endShape(CLOSE);

  // Light text hint on top
  push();
  translate(-W/2, -H/2);
  tint(255, 40);
  image(pgText, 0, 0);
  pop();
}

function drawTextMask(g) {
  g.background(0);
  g.fill(255);
  g.textAlign(CENTER, CENTER);

  // Choose a bold font available on the system (or just default)
  // You can also load a custom webfont via @font-face in index.html if you want.
  const line1 = 'NYC Climate Week';
  const line2 = '2025';

  // Auto-fit font size to width
  let fs = min(160, W * 0.08);
  g.textSize(fs);
  while (g.textWidth(line1) > W * 0.86 && fs > 10) {
    fs -= 2;
    g.textSize(fs);
  }

  const y = H * 0.42;
  g.text(line1, W/2, y);
  g.text(line2, W/2, y + fs * 0.95);
}

function clearBuffer(g) {
  g.noStroke();
  g.shader(blitShader);
  g.rect(0, 0, 1, 1);
}

function windowResized() {
  W = windowWidth; H = windowHeight;
  resizeCanvas(W, H);
  // Rebuild buffers & text to match new size
  pgText = createGraphics(W, H);
  pgText.pixelDensity(1);
  drawTextMask(pgText);

  growA = createGraphics(W, H, WEBGL);
  growB = createGraphics(W, H, WEBGL);
  clearBuffer(growA);
  clearBuffer(growB);
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('nyc-climate-week-growth', 'png');
  }
  if (key === 'r' || key === 'R') {
    // quick reseed by clearing buffers and resetting time
    t = 0;
    clearBuffer(growA);
    clearBuffer(growB);
  }
}