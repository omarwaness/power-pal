const fs = require("fs/promises");
const path = require("path");
const pngToIco = require("png-to-ico");

async function buildWindowsIcon() {
  const projectRoot = path.resolve(__dirname, "..");
  const sourceIconPath = path.join(projectRoot, "public", "icon.png");
  const buildDir = path.join(projectRoot, "build");
  const outputIconPath = path.join(buildDir, "icon.ico");

  await fs.mkdir(buildDir, { recursive: true });

  const iconBuffer = await pngToIco(sourceIconPath);
  await fs.writeFile(outputIconPath, iconBuffer);

  process.stdout.write(`Generated ${outputIconPath}\n`);
}

buildWindowsIcon().catch((error) => {
  console.error("Failed to generate Windows icon.");
  console.error(error);
  process.exitCode = 1;
});