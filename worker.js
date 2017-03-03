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

  ast.figure_out_scope();
  const compress = uglify.Compressor(options.compress || {
    warnings: false
  });
  ast = ast.transform(compress);

  ast.figure_out_scope(options.mangle || {});
  ast.compute_char_frequency(options.mangle || {});
  ast.mangle_names(options.mangle || {});
  if(options.mangle && options.mangle.props) {
    uglify.mangle_properties(ast, options.mangle.props);
  }

  let output = {};
  output.comments = Object.prototype.hasOwnProperty.call(options, "comments") ? options.comments : /^\**!|@preserve|@license/;
  output.beautify = options.beautify;
  output['ascii_only'] = true;
  for (let k in options.output) {
    output[k] = options.output[k];
  }

  let stream = uglify.OutputStream(output);
  ast.print(stream);
  stream = stream + "";
  return stream;
}
