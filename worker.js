'use strict';

const uglify = require("uglify-js");

module.exports = (input, file, options, cb) => {
  let stream;
  if (!/\.js($|\?)/.test(file)) return;
  try {
    stream = minimizeJs(input, file, options);
  } catch(err) {
    return cb(err);
  }
  cb(null, stream);
};

function minimizeJs(input, file, options) {
  uglify.base54.reset();
  let ast = uglify.parse(input, {
    filename: file,
  });

  if (options.compress !== false) {
    ast.figure_out_scope();
    const compress = uglify.Compressor(options.compress || {
      warnings: false
    });
    ast = ast.transform(compress);
  }

  let output = {};
  output.comments = Object.prototype.hasOwnProperty.call(options, "comments") ? options.comments : /^\**!|@preserve|@license/;
  output.beautify = options.beautify;
  for (let k in options.output) {
    output[k] = options.output[k];
  }

  let stream = uglify.OutputStream(output);
  ast.print(stream);
  stream = stream + "";
  return stream;
}
