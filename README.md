# vite-plugin-shared

[文档](https://github.com/GauharChan/vite-plugin-shared/tree/master/packages/shared#readme)

[npm](https://www.npmjs.com/package/vite-plugin-shared)

## 安装

```sh
pnpm i vite-plugin-shared -D
```

## 使用

在`vite.config.ts`中引入使用即可

```ts
// ...
import { vitePluginShared } from './plugins/vite-plugin-shared';
export default defineConfig(({ mode }) => ({
  base: '',
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
    vitePluginShared(),
  ],
  // ...
 }));
```

