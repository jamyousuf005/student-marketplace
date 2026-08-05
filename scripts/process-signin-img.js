const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:/Users/Admin/.gemini/antigravity-ide/brain/d5d8bca9-0c4c-4c15-944e-0916f6bf99ba/media__1785940579074.png';
const outputPath = path.join(__dirname, '../public/signin-illustration.png');
const authPath = path.join(__dirname, '../public/auth-illustration.png');

sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    const { width, height } = info;
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Helper to check if pixel is background checkerboard (white or light grey)
    function isBgPixel(x, y) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const isWhite = r > 230 && g > 230 && b > 230;
      const isGrey = Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && Math.abs(r - b) < 12 && r > 175 && r < 235;
      
      return isWhite || isGrey;
    }

    // Add border pixels to queue if they are background
    for (let x = 0; x < width; x++) {
      if (isBgPixel(x, 0)) queue.push(x, 0);
      if (isBgPixel(x, height - 1)) queue.push(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      if (isBgPixel(0, y)) queue.push(0, y);
      if (isBgPixel(width - 1, y)) queue.push(width - 1, y);
    }

    // BFS Flood Fill from outer borders
    let qIdx = 0;
    while (qIdx < queue.length) {
      const cx = queue[qIdx++];
      const cy = queue[qIdx++];
      const pos = cy * width + cx;
      if (visited[pos]) continue;
      visited[pos] = 1;

      // Make pixel transparent
      const pIdx = pos * 4;
      data[pIdx + 3] = 0;

      // Check 4 neighbors
      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nPos = ny * width + nx;
          if (!visited[nPos] && isBgPixel(nx, ny)) {
            queue.push(nx, ny);
          }
        }
      }
    }

    return sharp(data, { raw: { width, height, channels: 4 } })
      .png()
      .toFile(outputPath);
  })
  .then(() => {
    fs.copyFileSync(outputPath, authPath);
    console.log('Background flood fill completed! Pure transparent PNG generated.');
  })
  .catch(err => {
    console.error('Error processing:', err);
  });
