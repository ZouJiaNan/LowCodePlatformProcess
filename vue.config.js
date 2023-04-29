const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  //跨域
  devServer: {
    proxy: {
      '/test': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  }
})

