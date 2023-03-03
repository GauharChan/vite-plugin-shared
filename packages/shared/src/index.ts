import { Plugin } from 'vite';
import { PluginOptions, watch } from './watch';

export function vitePluginShared(options?: PluginOptions): Plugin {
  return {
    name: 'vite-plugin-shared',
    buildStart() {
      watch(options);
    },
    apply: 'serve',
  };
}

export default {
  vitePluginShared,
};
