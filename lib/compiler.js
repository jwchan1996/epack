/**
 * 当前逻辑是打包操作的核心，因此它在将来要完成很多的事情，
 * 所以使用类来管理代码
 */

class Compiler {
  constructor(config) {
    this.config = config
  }

  apply() {
    console.log('打包编译执行结束')
  }
}

module.exports = Compiler