'use strict';

const workerFarm = require('worker-farm');
const SourceMapConsumer = require("source-map").SourceMapConsumer;
const RawSource = require("webpack-sources").RawSource;
const SourceMapSource = require("webpack-sources").SourceMapSource;
const maxConcurrentWorkers = require('os').cpus().length;

function Compress(options) {
  this.options = options || {};
}

Compress.prototype.apply = function(compiler) {
  const options = this.options;

  console.log(`maxConcurrentWorkers: ${maxConcurrentWorkers}`);
  const worker = workerFarm({
    maxConcurrentWorkers,
    maxRetries: 0,
  }, require.resolve('./worker.js'));

  compiler.plugin('compilation', compilation => {

    compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
      const startTime = Date.now();
      let files = [];
      chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          files.push(file);
        });
      });
      compilation.additionalChunkAssets.forEach(file => {
        files.push(file);
      });
      files = files.filter(f => /\js($|\?)/.test(f));

      if (!files.length) return callback();

      const tasks = files.map(file => {
        const asset = compilation.assets[file];
        const input = asset.source();
        return new Promise((resolve, reject) => {
          worker(input, file, options, (err, stream) => {
            if (err) {
              return reject(err);
            }
            compilation.assets[file] = new RawSource(stream);
            resolve();
          });
        });
      });

      Promise.all(tasks)
        .then(() => {
          workerFarm.end(worker);
          console.log(`Compress done. Cpu length: ${maxConcurrentWorkers}. Cost ${Date.now() - startTime} ms.`);
          callback();
        })
        .catch(err => {
          workerFarm.end(worker);
          console.log(`Compress error`);
          console.error(err);
          compilation.errors.push(err);
          callback();
        });
    });

    compilation.plugin("normal-module-loader", context => {
      context.minimize = true;
    });
  });
};

module.exports = Compress;
