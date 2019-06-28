const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  publicPath: '/gd/',
  /*
                Vue-cli3:
                Crashed when using Webpack `import()` #2463
                https://github.com/vuejs/vue-cli/issues/2463

               */
  // pages: {
  //   index: {
  //     entry: ['babel-polyfill', 'src/main.js'],
  //     chunks: ['chunk-vendors', 'chunk-common', 'index']
  //   }
  // },
  configureWebpack: {
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    optimization: {
      removeAvailableModules: process.env.NODE_ENV !== 'development',
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            warnings: false,
            compress: {
              drop_console: true, // console
              drop_debugger: false,
              pure_funcs: ['console.log'] // 移除console
            }
          }
        })
      ]
    },
    externals: {
      // 'vue': 'Vue',
      // 'vuex': 'Vuex',
      // // 'moment': 'moment',
      // 'vue-router': 'VueRouter',
      // // 'element-ui': 'ELEMENT',
      // // 'ant-design-vue': 'antd',
      // // 'nprogress': 'NProgress',
      // 'axios': 'axios'
    }
    // devtool: 'source-map'

  },
  productionSourceMap: false,

  chainWebpack: config => {
    config.resolve.alias
      .set('@root', resolve(''))
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@layout', resolve('src/layout'))
      .set('@static', resolve('src/static'))
      .set('@utils', resolve('src/utils'))
    config
      .output
      .filename('[name].[hash].js')
      .end()
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          /*
                                                                      'primary-color': '#F5222D',/192.168.1.122
                                                                      'link-color': '#F5222D',
                                                                      'border-radius-base': '4px',
                                                                      */
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    port: 9558, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    proxy: {
      // 权限
      '/api/authcenter': {
        target: 'http://tms-dev.dj.com/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api/authcenter': '/authcenter'
        }
      },
      // 字典
      '/api/libraries': {
        target: 'http://192.168.1.125:810',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api/libraries': '/libraries'
        }
      },
      // 公共服务
      '/api/common/v1': {
        target: 'http://tms-dev.dj.com/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '/api/common/v1': '/common/v1'
        }
      },
      // 资源
      '/api/datum': {
        target: 'http://tms-dev.dj.com/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api/datum': '/datum'
        }
      },
      // order
      'api/order': {
        target: 'http://tms-dev.dj.com/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api/order': '/order'
        }
      },
      // platform
      'api/platform': {
        target: 'http://tms-dev.dj.com/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api/platform': '/platform'
        }
      },
      '/gateway': {
        target: 'https://www.easy-mock.com/mock/5b7bce071f130e5b7fe8cd7d/antd-pro',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/gateway': '/api'
        }
      },
      // 费用盘点
      '/api/settle': {
        target: 'http://tms-dev.dj.com/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api/settle': '/settle'
        }
      },
      // dataio
      '/api/dataio': {
        target: 'http://tms-dev.dj.com/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api/dataio': '/dataio'
        }
      }
    }
  },
  lintOnSave: undefined
}
