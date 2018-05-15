export const safe = fn => {
  if (fn) {
    return fn;
  }
  return function(/* _evt */) {};
};
