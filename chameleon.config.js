
// 设置静态资源的线上路径
const publicPath = '//www.static.chameleon.com/cml';
// 设置api请求前缀
const apiPrefix = 'https://api.chameleon.com';
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

cml.config.merge({
  templateLang: "cml",
  templateType: "html",
  platforms: ["web","weex","wx","alipay","baidu","qq"],
  buildInfo: {
    wxAppId: '123456'
  },
  optimize: {
    showWarning:true,
  },
  wx: {
    dev: {
    },
    build: {
      apiPrefix
    }
  },
  web: {
    dev: {
      analysis: true,
      console: false,
      isWrapComponent: false // 取消默认对组件的包裹
    },
    build: {
      analysis: true,
      publicPath: `${publicPath}/web/`,
      apiPrefix,
      isWrapComponent: false // 取消默认对组件的包裹
    }
  },
  weex: {
    dev: {
      isWrapComponent: false // 取消默认对组件的包裹
    },
    build: {
      publicPath: `${publicPath}/weex/`,
      apiPrefix,
      isWrapComponent: false // 取消默认对组件的包裹
    },
    custom: {
      publicPath: `${publicPath}/wx/`,
      apiPrefix
    }
  },
  optimize: {
    watchNodeModules: true, // 设置为true对于调试 node_modules 里面的内容很有帮助
    showWarning: true// 设置为true可以在构建过程中看到警告信息，比如编译过程中引入了同一个npm包的不同版本会在终端输出信息
  }
})

cml.utils.plugin('webpackConfig', function({ type, media, webpackConfig }, cb) {
  // cb函数用于设置修改后的配置
  debugger;
  webpackConfig.plugins.forEach((plugin) => {
    if(plugin.constructor.name === 'FriendlyErrorsWebpackPlugin'){
      plugin.showWarning = true;
    }
  });
  webpackConfig.plugins.push(new DuplicatePackageCheckerPlugin())
  cb({
    type,
    media,
    webpackConfig
  });
});