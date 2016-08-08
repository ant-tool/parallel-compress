# parallel-compress

## Usage

```
const compress = require('parallel-compress');
webpackConfig.plugins.push(new compress());
```

## Notice

不需要 uglify 插件: `webpack.optimize.UglifyJsPlugin`

```
webpackConfig.plugins.some(function(plugin, i) {
  if (plugin instanceof webpack.optimize.UglifyJsPlugin) {
    webpackConfig.plugins.splice(i, 1);
    return true;
  }
});
```


