const { spawn } = require("child_process");
const path = require("path");

function quoteArg(value) {
  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = process.platform === "win32"
      ? spawn([command, ...args].map(quoteArg).join(" "), {
          cwd: options.cwd,
          env: options.env,
          stdio: "inherit",
          shell: true,
        })
      : spawn(command, args, {
          cwd: options.cwd,
          env: options.env,
          stdio: "inherit",
          shell: false,
        });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function createEnv(overrides = {}) {
  const env = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("=") || value == null) {
      continue;
    }

    env[key] = value;
  }

  return {
    ...env,
    ...overrides,
  };
}

function getBinCommand(name) {
  if (name === "node") {
    return process.execPath;
  }

  return process.platform === "win32" ? `${name}.cmd` : name;
}

function createOutputDirName() {
  const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
  return `release-builds/${timestamp}`;
}

async function packageWindowsApp() {
  const target = process.argv[2] || "nsis";
  const projectRoot = path.resolve(__dirname, "..");
  const outputDir = createOutputDirName();
  const defaultEnv = createEnv();

  await runCommand(getBinCommand("npm"), ["run", "build"], { cwd: projectRoot, env: defaultEnv });
  await runCommand(getBinCommand("npm"), ["run", "build:icon"], { cwd: projectRoot, env: defaultEnv });
  await runCommand(
    getBinCommand("npx"),
    ["electron-builder", "--win", target, `--config.directories.output=${outputDir}`],
    { cwd: projectRoot, env: defaultEnv }
  );
  await runCommand(getBinCommand("node"), [path.join("scripts", "sync-package-output.cjs")], {
    cwd: projectRoot,
    env: createEnv({ PACKAGE_OUTPUT_DIR: outputDir }),
  });

  process.stdout.write(`Packaged app written to ${path.join(projectRoot, outputDir)}\n`);
}

packageWindowsApp().catch((error) => {
  console.error("Failed to package Windows app.");
  console.error(error);
  process.exitCode = 1;
});