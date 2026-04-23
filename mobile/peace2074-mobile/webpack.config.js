const { relative, resolve, sep } = require('path')
const webpack = require('@nativescript/webpack')

module.exports = (env) => {
  webpack.init(env)
  return webpack.resolveConfig()
}
