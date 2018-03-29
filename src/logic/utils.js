const identity = x => x;

export const isFn = fn => typeof fn === 'function';

// From: https://davidwalsh.name/javascript-arguments
const getFunctionArgs = func => {
  // First match everything inside the function argument parens.
  const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

  // Split the arguments string into an array comma delimited.
  return (
    args
      .split(',')
      // Ensure no inline comments are parsed and trim the whitespace.
      .map(arg => arg.replace(/\/\*.*\*\//, '').trim())
      // Ensure no undefined values are added.
      .filter(arg => arg)
  );
};
const functionToString = func => `function ${func.name}(${getFunctionArgs(func).join(', ')}) {}`;

export const debug = (msg, rest) => {
  const log = isFn(rest) ? functionToString(rest) : JSON.stringify(rest);

  console.log(msg, log);
};

// export const applyLogic = (
//   logic,
//   state,
//   next,
//   sub,
//   actionIn$,
//   deps,
//   startLogicCount,
//   monitor$,
// ) => {
//   if (!state) { throw new Error('state is not defined'); }

//   if (sub) {
//     sub.unsubscribe();
//   }

//   const wrappedLogic = logic.map((mappedLogic, idx) => {
//     const namedLogic = naming(mappedLogic, idx + startLogicCount);
//     return wrapper(namedLogic, state, deps, monitor$);
//   });

//   const actionOut$ = wrappedLogic.reduce((acc$, wep) => wep(acc$), actionIn$);

//   const newSub = actionOut$.subscribe((action) => {
//     debug('actionEnd$', action);
//     try {
//       const result = action();
//       debug('result', result);
//     } catch (err) {
//       // eslint-disable-next-line no-console
//       // console.error(
//       //  'error in mw dispatch or next call, probably in middlware/reducer/render fn:', err);
//       // const msg = (err && err.message) ? err.message : err;
//       // monitor$.next({ action, err: msg, op: 'nextError' });
//     }
//     // at this point, action is the transformed action, not original
//     monitor$.next({ nextAction: action, op: 'bottom' });
//   });

//   return {
//     action$: actionOut$,
//     sub: newSub,
//     logicCount: startLogicCount + logic.length,
//   };
// };

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
export const compose = (...funcs) => {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
};

/**
 * if type is a fn call toString() to get type, redux-actions
 * if array, then check members
 */
export const typeToStrFns = type => {
  if (Array.isArray(type)) {
    return type.map(x => typeToStrFns(x));
  }
  return typeof type === 'function' ? type.toString() : type;
};

export const setIfUndefined = (obj, propName, propValue) => {
  if (typeof obj[propName] === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    obj[propName] = propValue;
  }
};

export const matchesType = (tStrArrRe, type) => {
  /* istanbul ignore if  */
  if (!tStrArrRe) {
    return false;
  } // nothing matches none
  if (typeof tStrArrRe === 'string') {
    return tStrArrRe === type || tStrArrRe === '*';
  }
  if (Array.isArray(tStrArrRe)) {
    return tStrArrRe.some(x => matchesType(x, type));
  }
  // else assume it is a RegExp
  return tStrArrRe.test(type);
};

export default {
  identity,
  matchesType,
  debug,
  isFn
};
