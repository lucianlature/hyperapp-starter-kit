import wrapper from './logicWrapper';

/**
  Find duplicates in arrLogic by checking if ref to same logic object
  @param {array} arrLogic array of logic to check
  @return {array} array of indexes to duplicates, empty array if none
 */
const findDuplicates = arrLogic => arrLogic.reduce((acc, x1, idx1) => {
  if (arrLogic.some((x2, idx2) => (idx1 !== idx2 && x1 === x2))) {
    acc.push(idx1);
  }
  return acc;
}, []);

const identity = x => x;

/**
 * Implement default names for logic using type and idx
 * @param {object} logic named or unnamed logic object
 * @param {number} idx  index in the logic array
 * @return {object} namedLogic named logic
 */
export const naming = (logic, idx) => {
  if (logic.name) { return logic; }
  return {
    ...logic,
    name: `L(${logic.type.toString()})-${idx}`,
  };
};

export const isFn = fn => typeof fn === 'function';

// From: https://davidwalsh.name/javascript-arguments
const getFunctionArgs = (func) => {
  // First match everything inside the function argument parens.
  const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

  // Split the arguments string into an array comma delimited.
  return args.split(',')
    // Ensure no inline comments are parsed and trim the whitespace.
    .map(arg => arg.replace(/\/\*.*\*\//, '').trim())
    // Ensure no undefined values are added.
    .filter(arg => arg);
};
const functionToString = func => `function ${func.name}(${getFunctionArgs(func).join(', ')}) {}`;
export const debug = (msg, rest) => {
  const log = isFn(rest)
    ? functionToString(rest)
    : JSON.stringify(rest);

  console.log(msg, log);
};

export const applyLogic = (
  logic,
  state,
  next,
  sub,
  actionIn$,
  deps,
  startLogicCount,
  monitor$,
) => {
  if (!state) { throw new Error('state is not defined'); }

  if (sub) {
    sub.unsubscribe();
  }

  const wrappedLogic = logic.map((mappedLogic, idx) => {
    const namedLogic = naming(mappedLogic, idx + startLogicCount);
    return wrapper(namedLogic, state, deps, monitor$);
  });

  const actionOut$ = wrappedLogic.reduce((acc$, wep) => wep(acc$), actionIn$);

  const newSub = actionOut$.subscribe((action) => {
    debug('actionEnd$', action);
    try {
      const result = action();
      debug('result', result);
    } catch (err) {
      // eslint-disable-next-line no-console
      // console.error(
      //  'error in mw dispatch or next call, probably in middlware/reducer/render fn:', err);
      // const msg = (err && err.message) ? err.message : err;
      // monitor$.next({ action, err: msg, op: 'nextError' });
    }
    // at this point, action is the transformed action, not original
    monitor$.next({ nextAction: action, op: 'bottom' });
  });

  return {
    action$: actionOut$,
    sub: newSub,
    logicCount: startLogicCount + logic.length,
  };
};

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

export default {
  findDuplicates,
  identity,
  naming,
  applyLogic,
  debug,
  isFn,
};
