module.exports = {
  parser: false,
  plugins: {
    'postcss-import': {},
    'postcss-cssnext': {
      warnForDuplicates: false
    },
    cssnano: {}
  }
};
