/**
 * 当前逻辑是打包操作的核心，因此它在将来要完成很多的事情，
 * 所以使用类来管理代码
 */

const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const generator = require('@babel/generator').default

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
    // 用于保存键名与对应的代码内容
    this.modules = {}  
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
    const { sourceCode, dependencies } = this.parse(source, path.dirname(moduleId))

    // 4 保存模块 id 与内容的对应关系（ modules ）
    this.modules[moduleId] = sourceCode

    // 5 递归地找到所有需要加载的模块
    dependencies.forEach(dep => {
      this.buildRely(path.resolve(this.iCwd, dep), false)
    })
    console.log(this.modules)
  }

  outputFile() {}

  // 解析当前模块的代码内容，使用 AST 语法树对 sourceCode 进行增删改查 astexplorer.net
  // 这里 parentPath 是 ./src，作为参数传递是为了方便 parse 函数获取，动态获取路径
  // AST 是源代码语法对应的树状结构，js 引擎能够把字符串代码变成一个可操作的节点
  // 这里我们可以按需修改节点里面的内容，再把 AST 转换为可执行的代码供我们执行
  // 我们不需要自己来操作语法树，babel 已经帮我们实现了
  // @babel/parser: 源代码 -> 语法树
  // @babel/traverse: 遍历语法树
  // @babel/types: 遍历语法树找到对应内容后，需要通过 types 去修改
  // @babel/generator: 修改完语法树后，还原为源代码
  parse(sourceCode, parentPath) {
    // 储存入口文件中加载的模块，以便于后面对模块进行递归遍历
    let dependencies = []

    // 1 将字符串形式的代码处理为 AST 语法树
    let ast = parser.parse(sourceCode)

    // 2 遍历语法树，找到相应的节点内容，然后进行修改
    traverse(ast, {
      // 进来之后我们需要找到想要的节点
      CallExpression(expression) {
        let node = expression.node
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          // 获取到其他需要被加载的路径
          let moduleName = node.arguments[0].value
          // 处理它的后缀（我们这里只支持 js）
          moduleName = moduleName + ( path.extname(moduleName) ? '' : '.js' )
          // 最后再将它的前面添加上动态的 ./src
          moduleName = './' + path.join(parentPath, moduleName)

          // 将 ./src/a.js 与 ./src/log/b.js 保存在数组中，因为这些都是将来我们还需要再
          // 递归去执行加载的模块
          dependencies.push(moduleName)

          // 将上述处理 OK之后的内容写到语法树上
          node.arguments = [t.stringLiteral(moduleName)]
        }
      }
    })

    // 3 将修改后的语法树代码重新变为可执行的代码
    sourceCode = generator(ast).code

    // 4 将修改过程中拿到的内容进行返回
    return { sourceCode, dependencies }
  }
}

module.exports = Compiler