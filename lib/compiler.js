/**
 * 当前逻辑是打包操作的核心，因此它在将来要完成很多的事情，
 * 所以使用类来管理代码
 */

const fs = require('fs')
const path = require('path')

class Compiler {
  constructor(config) {
    // 保存全部的配置信息
    this.config = config 
    // 用于替换 built.js 中的主入口路径
    this.entryId
    // 获取当前配置信息的入口名称（ ./src/index.js ）
    this.entry = config.entry
    // 获取当前的工作目录
    this.iCwd = process.cwd()
  }

  // 执行打包操作的主逻辑
  apply() {
    // 1 依据入口来创建打包的依赖关系（ a->b, b->c, a->d）
    // 因为我们第一次使用的时候需要依据 entry 的模块路径作为开始
    // 因此需要考虑 index.js 的路径
    // 这里第二个参数用来区分当前模块路径是否是主入口
    this.buildRely(path.resolve(this.iCwd, this.entry), true)
    // 2 将打包之后的文件内容输出到指定位置
    this.outputFile()
  }

  // 读取主入口中的内容，然后获取那些需要递归加载的模块路径
  buildRely(modulePath, isEntry) {
    // 1 读取模块路径对应的代码内容
    const source = fs.readFileSync(modulePath, 'utf-8')
    // 2 依据当前模块路径来获取模块 id（ ./src/index.js ），同时判断当前是否为主入口
    const moduleId = './' + path.relative(this.iCwd, modulePath)
    if (isEntry) {
      this.entryId = moduleId
    }
    // 3 解析当前模块中的代码内容（ 替换 require，将 require 替换为 __webpack_require__，补全作为键值的模块路径 ）
    this.parse(source, path.dirname(moduleId))
    // 4 保存模块 id 与内容的对应关系（ modules ）
    // 5 递归地找到所有需要加载的模块
  }

  outputFile() {}

  // 解析当前模块的代码内容
  parse(sourceCode, parentPath) {
    console.log('当前模块代码内容', sourceCode)
    console.log('当前模块父路径', parentPath)
    console.log('解析模块内容完成')
  }
}

module.exports = Compiler