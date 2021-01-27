# epack

## 目录结构

- bin/epack.js: 用于 epack 的命令参数处理
- lib/compiler.js: 用于 epack 的业务处理
- package.json: 配置 main 与 bin 入口文件

## 配置 package.json

```json
// package.json
{
  "main": "./lib/compiler.js",  // 包入口文件
  "bin": {
    "epack": "./bin/epack.js" // 包可执行脚本文件入口
  }
}
```

## 测试可用性：将命令链接到全局

在项目的根目录执行 yarn link 命令，将命令链接到全局。

此时，在命令行执行 epack 可以看到对应执行结果输出。