/**
 * @author gauharchan
 * @description 遍历views下的assets文件夹，生成各自模块资源的统一出口shared.ts
 */

import ChildProcess from 'node:child_process';
import chalk from 'chalk';
import fs from 'node:fs';
import Path from 'node:path';

export interface AssetsFile {
  url: string;
  name: string;
}

const sep = Path.sep;
/** 最终生成的shared.ts文件集合 */
const sharedList = new Set();
/** 项目根目录 */
const dirName = process.cwd();

/**
 * @author: gauharchan
 * @description 递归遍历传入的路径，找到所有assets文件夹的路径
 * @param {string} path 默认是遍历views
 */
export function getAssetsSet(
  path = Path.resolve(dirName, 'src/views'),
  pathSet = new Set<string>()
): Set<string> {
  const dirArr = fs.readdirSync(path);
  dirArr.forEach((dir) => {
    const isDirectory = fs.lstatSync(`${path}/${dir}`).isDirectory();
    if (isDirectory) {
      if (dir === 'assets') {
        pathSet.add(Path.resolve(path, 'assets'));
      } else {
        // 如果是其他文件夹，递归遍历
        getAssetsSet(`${path}/${dir}`, pathSet);
      }
    }
  });
  return pathSet;
}
/**
 * @description 根据路径遍历assets所有目录创建shared.ts
 * @param { string } targetPath 目标assets路径
 */
export function createShared(targetPath: string) {
  // assets的子目录
  const assetsModules = fs.readdirSync(targetPath);
  // 遍历获取所有ts文件
  const allTs = recursion(
    targetPath,
    assetsModules.filter((file) => !file.endsWith('.ts')) // 剔除shared.ts
  );
  // 写入代码内容
  fs.writeFileSync(`${targetPath}/shared.ts`, getContent(allTs), 'utf-8');
  sharedList.add(`${targetPath}/shared.ts`);
}

/**
 * @author: gauharchan
 * @description 获取assets目录下所有的ts文件
 * @param {string} parentPath 当前文件夹路径
 * @param {string[]} childDirs 当前文件夹下的子目录、子文件
 * @param {Set} pathSet ts文件集合
 * @returns {Set} pathSet ts文件集合
 */
function recursion(
  parentPath: string,
  childDirs: string[],
  pathSet = new Set<AssetsFile>()
): Set<AssetsFile> {
  childDirs.forEach((item) => {
    const stat = fs.lstatSync(Path.resolve(parentPath, item));
    // 如果是文件夹
    if (stat.isDirectory()) {
      // components 直接取compoents/${dir}/index.ts
      if (item.toLowerCase().includes('component')) {
        const componentPath = Path.resolve(parentPath, item);
        fs.readdirSync(componentPath)
          .filter((com) => fs.lstatSync(Path.resolve(componentPath, com)).isDirectory())
          .forEach((com) => {
            // 判断有没有index.ts文件
            if (fs.existsSync(Path.resolve(componentPath, com, 'index.ts'))) {
              pathSet.add({
                url: Path.resolve(componentPath, com, 'index.ts'),
                name: getExportName(Path.resolve(componentPath, com), 'index.ts'),
              });
            }
          });
      } else {
        const path = Path.resolve(parentPath, item);
        // 获取子目录
        const dir = fs.readdirSync(path);
        if (!dir) return;
        // 递归遍历解析文件夹
        recursion(path, dir, pathSet);
      }
    } else if (item.endsWith('.ts')) {
      // && stat.size > 0 stat.size 过滤空文件
      // ts文件，直接记录
      pathSet.add({
        url: Path.resolve(parentPath, item),
        name: getExportName(parentPath, item),
      });
    }
  });
  return pathSet;
}

/** 生成文件内容 */
function getContent(pathSet: Set<AssetsFile>) {
  let importArr: string[] = [];
  // 导出的变量名
  let exportArr: string[] = [];
  pathSet.forEach((item) => {
    const index = item.url.search(`${sep}assets`);
    // 解析获取/assets后面的路径 windows和mac的路径开头部分不一致，window以/开头
    const url =
      `.${item.url.startsWith('/') ? '' : '/'}` + item.url.substring(index + '/assets'.length);
    importArr.push(
      `import * as ${item.name} from '${url.replaceAll('\\', '/').split('.ts')[0]}';\n`
    );
    exportArr.push(item.name);
  });
  const content = `${importArr.join('')}
export {
  ${exportArr.join(',\n  ')},
};
`;
  return content;
}

/** hooksUseWeek 文件夹名+ts文件名(驼峰) */
function getExportName(parentPath: string, fileName: string) {
  /** 上层文件夹名 */
  const firstName = parentPath.split(sep).pop();
  /** 文件名，不包含文件类型后缀 */
  const lastName = fileName.split('.').shift() || '';
  const arr = lastName.split('');
  // 首字母大写
  arr[0] = arr[0].toUpperCase();
  return `${firstName}${arr.join('')}`;
}

/** Windows系统错误提示 */
function printWindowsTip() {
  console.log();
  console.log(chalk.bgBlue.black('重要的事情说三遍'));
  Array.from({ length: 3 }).forEach(() => {
    console.log(
      `${chalk.bgRed.white(' ERROR ')} ${chalk.red(
        `Eslint修复失败，Windows系统请使用 ${chalk.bgBlue.blueBright(
          `${chalk.bold('bash终端')}`
        )} 运行命令，否则请手动修复`
      )}`
    );
  });
}

/**
 * @author: gauharchan
 * @description 执行函数
 * @param {string[]} dirs 默认遍历整个views
 */
export function run(dirs: string[] | Set<string> = getAssetsSet()) {
  sharedList.clear();
  dirs.forEach((dir) => createShared(dir));
  const fileUrls = Array.from(sharedList).join(' ');
  // eslint 修复
  try {
    ChildProcess.execSync(`eslint ${fileUrls} --fix`);
    console.log(
      `${chalk.bgGreen.black(' SUCCESS ')} ${chalk.cyan(
        `生成了${sharedList.size}个文件，并已经修复好Eslint`
      )}`
    );
  } catch (error) {
    printWindowsTip();
  }
}
