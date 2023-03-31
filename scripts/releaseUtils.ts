import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import colors from 'picocolors';
import fs from 'fs-extra';
import minimist from 'minimist';
import type { Options as ExecaOptions, ExecaReturnValue } from 'execa';
import { execa } from 'execa';

export const args = minimist(process.argv.slice(2));

interface Pkg {
  name: string;
  version: string;
  private?: boolean;
}
export function getPackageInfo(pkgName: string): {
  pkg: Pkg;
  pkgName: string;
  pkgDir: string;
  pkgPath: string;
  currentVersion: string;
} {
  const pkgDir = path.resolve(__dirname, '../packages/' + pkgName);

  if (!existsSync(pkgDir)) {
    throw new Error(`Package ${pkgName} not found`);
  }

  const pkgPath = path.resolve(pkgDir, 'package.json');
  const pkg: Pkg = require(pkgPath);
  const currentVersion = pkg.version;

  if (pkg.private) {
    throw new Error(`Package ${pkgName} is private`);
  }

  return {
    pkg,
    pkgName,
    pkgDir,
    pkgPath,
    currentVersion,
  };
}

export function step(msg: string): void {
  return console.log(colors.cyan(msg));
}

export function updateVersion(pkgPath: string, version: string): void {
  const pkg = fs.readJSONSync(pkgPath);
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

export async function run(
  bin: string,
  args: string[],
  opts: ExecaOptions<string> = {}
): Promise<ExecaReturnValue<string>> {
  return execa(bin, args, { stdio: 'inherit', ...opts });
}

export async function publishPackage(pkdDir: string, tag?: string): Promise<void> {
  const publicArgs = ['publish', '--access', 'public'];
  if (tag) {
    publicArgs.push(`--tag`, tag);
  }
  await run('npm', publicArgs, {
    cwd: pkdDir,
  });
}

export async function updateTemplateVersions(): Promise<void> {
  const viteVersion = (await fs.readJSON(path.resolve(__dirname, '../packages/vite/package.json')))
    .version;
  if (/beta|alpha|rc/.test(viteVersion)) return;

  const dir = path.resolve(__dirname, '../packages/create-vite');

  const templates = readdirSync(dir).filter((dir) => dir.startsWith('template-'));
  for (const template of templates) {
    const pkgPath = path.join(dir, template, `package.json`);
    const pkg = require(pkgPath);
    pkg.devDependencies.vite = `^` + viteVersion;
    if (template.startsWith('template-vue')) {
      pkg.devDependencies['@vitejs/plugin-vue'] =
        `^` +
        (await fs.readJSON(path.resolve(__dirname, '../packages/plugin-vue/package.json'))).version;
    }
    if (template.startsWith('template-react')) {
      pkg.devDependencies['@vitejs/plugin-react'] =
        `^` +
        (await fs.readJSON(path.resolve(__dirname, '../packages/plugin-react/package.json')))
          .version;
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
}
