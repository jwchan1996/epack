#! /usr/bin/env node

const path = require('path')
const { config } = require('process')

// 获取获取配置文件信息
const configPath = path.join(process.cwd(), 'webpack.config.js')
// let configPath = path.join(__dirname, '../../../', 'webpack.config.js')

// 按照路径来读取配置内容
const configContent = require(configPath)
// console.log(configContent)

// 将当前获取到的文件信息传递给具体的业务功能实现操作
// 下面代码表示会从 package.json 的 main 包入口文件导入
const Compiler = require('..')  // 导入的是一个 Compiler 类
const c = new Compiler(configContent)
c.apply()