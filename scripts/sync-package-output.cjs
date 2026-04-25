const fs = require("fs/promises");
const path = require("path");

async function syncPackageOutput() {
  const projectRoot = path.resolve(__dirname, "..");
  const packageJsonPath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  const configuredOutputDir = process.env.PACKAGE_OUTPUT_DIR || packageJson.build?.directories?.output || "release-build";
  const sourceDir = path.join(projectRoot, configuredOutputDir);
  const targetDir = path.join(projectRoot, "dist", "desktop");

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true });

  process.stdout.write(`Copied packaged app to ${targetDir}\n`);
}

syncPackageOutput().catch((error) => {
  console.error("Failed to copy packaged output into dist.");
  console.error(error);
  process.exitCode = 1;
});