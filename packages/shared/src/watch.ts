import { run, getAssetsSet } from './shared';

import chalk from 'chalk';
import chokidar from 'chokidar';
import Path from 'node:path';

/** 插件配置 */
export interface PluginOptions {
  /** 是否展示对已删除文件引用的文件列表 */
  showDeleted: boolean;
}

let watcher: chokidar.FSWatcher | null = null;
let ready = false;
const sep = Path.sep;

console.log(
  'run, getAssetsSet, chalk',
  run,
  getAssetsSet,
  chalk,
  watcher,
  ready,
  sep,
  findImportFile,
  parseAndCreate
);

/**
 * @author: gauharchan
 * @description 监听文件改动
 * @param { Object } options 配置
 * @param { boolean } options.showDeleted 是否展示对已删除文件引用的文件列表
 */
export function watch(options?: PluginOptions) {
  // 文件新增时
  function addFileListener(path: string) {
    // 过滤copy文件
    if (path.includes('copy')) return;
    if (ready) {
      parseAndCreate(path);
    }
  }
  // 删除文件时，需要把文件里所有的用例删掉
  function fileRemovedListener(path: string) {
    parseAndCreate(path);
    options?.showDeleted && findImportFile(path);
  }
  if (!watcher) {
    // 监听assets文件夹
    watcher = chokidar.watch(Array.from(getAssetsSet()));
  }
  watcher
    .on('add', addFileListener)
    // .on('addDir', addDirecotryListener)
    // .on('change', fileChangeListener)
    .on('unlink', fileRemovedListener)
    // .on('unlinkDir', directoryRemovedListener)
    .on('error', function (error) {
      console.log();
      console.log(`${chalk.bgRed.white(' ERROR ')} ${chalk.red(`Error happened ${error}`)}`);
    })
    .on('ready', function () {
      console.log();
      console.log(`${chalk.bgGreen.black(' shared ')} ${chalk.cyan('检测assets文件夹中')}`);
      // 全量生成一遍shared文件
      run();
      ready = true;
    });
}
/**
 * @author: gauharchan
 * @description 解析目标路径，只更新目标路径的shared.ts
 * @param {string} path 新增、删除的文件路径
 */
function parseAndCreate(path: string) {
  // 只监听ts文件(不管图片)  排除shared.ts(否则自动生成后会再次触发add hook) 组件只关心components/xx/index.ts
  const winMatch = /assets\\component(s)?\\[a-zA-Z]*\\index.ts/g;
  const unixMatch = /assets\/component(s)?\/[a-zA-Z]*\/index.ts/g;
  const componentMatch = sep == '/' ? unixMatch : winMatch; // match不到是null
  if ((path.endsWith('.ts') && !path.endsWith('shared.ts')) || path.match(componentMatch)) {
    // 找到当前的assets目录
    const assetsParent = path.match(/.*assets/)?.[0];
    assetsParent && run([assetsParent]);
  }
}

/**
 * @author: gauharchan
 * @description 找到对 当前删除(重命名)的文件 有引用的所有文件
 * @param {string} path 当前删除(重命名)的文件路径
 */
function findImportFile(_path: string) {}
