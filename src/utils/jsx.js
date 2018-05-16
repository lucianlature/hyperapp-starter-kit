export default function(propMap) {
  return function(h) {
    return function(type, props, ...extra) {
      const args = [type, props];
      if (props) {
        Object.keys(propMap).forEach(fromProp => {
          if (props[fromProp]) {
            const toProp = propMap[fromProp];
            props[toProp] = props[fromProp];
            delete props[fromProp];
          }
        });
      }
      args.push([].concat(extra));
      return h.apply(null, args);
    };
  };
}
