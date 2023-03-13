# vite-plugin-shared 调试

## 在主项目中安装依赖

即打开终端指向项目的根目录，本项目采用了`Monorepo`，因此所有的子包都会同步安装依赖

```sh
pnpm i
```

## package

`packages/shared`右键打开集成终端，或者在终端自己手动进入目录，构建

```sh
pnpm build
```

## playground

1. `playground/shared`右键打开集成终端，或者在终端自己手动进入目录，启动`vite serve`服务

   ```sh
   pnpm dev
   ```

   观察`src/views`下的 assets 目录，会根据已有的文件生成出口文件`shared.ts`

   如果修改了`packages/shared`，需要在`packages/shared`打包`build`之后；重新执行上面的 1、2 步骤

2. 新增、删除`assets`下的文件
