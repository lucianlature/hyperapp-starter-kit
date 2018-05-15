export default (fn, ...rest) =>
  function(/*_evt*/) {
    if (fn) {
      fn.apply(null, rest);
    }
  };
