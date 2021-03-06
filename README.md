title：如何在构建阶段明确依赖是否有同一个npm包的不同版本？
---

### 场景构造

构造依赖同一个npm包的不同版本场景，便于测试

为了便于测试效果，我发布了一个 npm 包，进行测试
```
npm i lerna-tool1@3.0.0 lodash@4.x

```

在`index.cml`中
```javascript
import lodash from 'lodash';
import L from 'lerna-tool1'
```

打包后我们可以看到会有lodash的不同版本都会被打包进去。

![](./lodash.png)

### 方案一：升级chameleon-tool

> chameleon-tool@1.0.6-alpha.6 内置支持了检查能力

#### 首先升级CLI命令行
```
npm i chameleon-tool@1.0.6-alpha.6 -g
```

#### 增加配置项

`showWarning:true`

```javascript
optimize: {
  showWarning: true// 设置为true可以在构建过程中看到警告信息，比如编译过程中引入了同一个npm包的不同版本会在终端输出信息
}
```

执行命令 `cml web dev ` 在终端输出如下：


```zsh
 WARNING  Compiled with 1 warnings                                                                           16:29:12

 warning  

lodash
  Multiple versions of lodash found:
    3.10.1 ./~/lerna-tool1/~/lodash from ./~/lerna-tool1/index.js
    4.17.15 ./~/lodash from ./src/pages/index/index.cml

Check how you can resolve duplicate packages: 
https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin#resolving-duplicate-packages-in-your-bundle
```


### 方案二：如何在不升级chameleon-tool的情况下达到同样的效果

注意版本对应关系 chameleon-tool@1.x 内部依赖的是 webpack@3.x的版本，所以需要安装版本对应关系如下

Webpack 3.x
`npm install duplicate-package-checker-webpack-plugin@^2.1.0 --save-dev`


参考：[duplicate-package-checker-webpack-plugin](https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin)

修改 `chameleon.config.js`

```javascript
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');


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
```

### 如何解决依赖同一个npm包的多个版本问题？

[SemVer](https://semver.org/)
SemVer (Semantic Versioning, 语义化版本).

SemVer最基本的结构是major.minor.patch, 如1.2.3.
其中,

major为主版本号, 当【有非向后兼容】(即breaking change)的时候, 更新major.
minor为次版本号, 当【有向后兼容的时候】, 更新minor.
patch为补丁号, 当【有向后兼容的bug fix时】, 更新patch.
npm使用SemVer来标注包的版本, 这些配置写入到了package.json中.

除了指定固定的版本号, package.json中还可以指定版本号范围.

1.2.x (x也可以用*代替), 相当于>=1.2.0 <1.3.0
1.x.x, 相当于>=1.0.0 <2.0.0
波浪线(Tilde), ~1.2.3相当于>=1.2.3 <1.3.0, 即minor不能增加.
破折号(Caret), ^1.2.3相当于>=1.2.3 <2.0.0, 即major不能增加.


https://docs.npmjs.com/cli/dedupe
web端包体积过大如何优化？

1.配置构建bundle分析项，analysis:true

2.查看各个模块占用大小

3.针对特定模块进行优化，比如重复的npm包采用 npm dedupe 抹平，注意重复包版本是否兼容

4.理论上`npm dedupe` 会将版本兼容的重复npm包提取出来，而不会提取不兼容的版本

更多理解参考npm官方专门提供的一篇文章[npm3 Duplication](https://npm.github.io/how-npm-works-docs/npm3/duplication.html)
