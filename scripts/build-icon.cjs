const fs = require("fs/promises");
const path = require("path");
const pngToIco = require("png-to-ico");
const { PNG } = require("pngjs");
const { readPNG } = require("png-to-ico/lib/png");

function createSquareIconBuffer(image) {
  const size = Math.max(image.width, image.height);
  const square = new PNG({ width: size, height: size });
  const offsetX = Math.floor((size - image.width) / 2);
  const offsetY = Math.floor((size - image.height) / 2);

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const sourceIndex = (y * image.width + x) * 4;
      const targetIndex = ((y + offsetY) * size + (x + offsetX)) * 4;

      square.data[targetIndex] = image.data[sourceIndex];
      square.data[targetIndex + 1] = image.data[sourceIndex + 1];
      square.data[targetIndex + 2] = image.data[sourceIndex + 2];
      square.data[targetIndex + 3] = image.data[sourceIndex + 3];
    }
  }

  return PNG.sync.write(square);
}

async function buildWindowsIcon() {
  const projectRoot = path.resolve(__dirname, "..");
  const sourceIconPath = path.join(projectRoot, "public", "icon.png");
  const buildDir = path.join(projectRoot, "build");
  const outputIconPath = path.join(buildDir, "icon.ico");

  await fs.mkdir(buildDir, { recursive: true });

  const sourceImage = await readPNG(sourceIconPath);
  const iconSource =
    sourceImage.width === sourceImage.height
      ? sourceIconPath
      : createSquareIconBuffer(sourceImage);

  const iconBuffer = await pngToIco(iconSource);
  await fs.writeFile(outputIconPath, iconBuffer);

  process.stdout.write(`Generated ${outputIconPath}\n`);
}

buildWindowsIcon().catch((error) => {
  console.error("Failed to generate Windows icon.");
  console.error(error);
  process.exitCode = 1;
});