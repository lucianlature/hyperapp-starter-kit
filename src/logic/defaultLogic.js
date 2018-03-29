import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/toPromise';
import utils from './utils';

const { findDuplicates, identity, applyLogic, debug } = utils;

const OP_INIT = 'init'; // initial monitor op before anything else

/**
 * @param {array} arrLogic array of logic items (each created with
 * createLogic) used in the middleware. The order in the array
 * indicates the order they will be called in the middleware.
 * @param {object} deps optional runtime dependencies that will be
 * injected into the logic hooks. Anything from config to instances
 * of objects or connections can be provided here. This can simply
 * testing. Reserved property names: getState, action, and ctx.
 * @returns {function} middleware with additional methods
 * addLogic and replaceLogic
 */
export default (logic = [], deps = {}) => {
  if (!Array.isArray(logic)) {
    throw new Error('createLogicMiddleware needs to be called with an array of logic items');
  }
  const duplicateLogic = findDuplicates(logic);
  if (duplicateLogic.length) {
    throw new Error(`duplicate logic, indexes: ${duplicateLogic}`);
  }

  const actionSrc$ = new Subject(); // Monitor flow action stream
  const monitor$ = new Subject(); // monitor all activity
  const lastPending$ = new BehaviorSubject({ op: OP_INIT });

  monitor$
    .scan(
      (acc, x) => {
        // append a pending logic count
        let pending = acc.pending || 0;
        switch (x.op) { // eslint-disable-line default-case
          case 'top': // action at top of logic stack
          case 'begin': // starting into a logic
            pending += 1;
            break;

          case 'end': // completed from a logic
          case 'bottom': // action cleared bottom of logic stack
          case 'nextDisp': // action changed type and dispatched
          case 'filtered': // action filtered
          case 'dispatchError': // error when dispatching
          case 'cancelled': // action cancelled before intercept complete
            // dispCancelled is not included here since
            // already accounted for in the 'end' op
            pending -= 1;
            break;
        }
        return {
          ...x,
          pending
        };
      },
      { pending: 0 }
    )
    .subscribe(lastPending$); // pipe to lastPending

  let savedState;
  let savedNext;
  let actionEnd$;
  let logicSub;
  let logicCount = 0; // used for implicit naming
  let savedLogicArr = logic; // keep for uniqueness check

  function mw(state) {
    if (savedState && savedState !== state) {
      throw new Error('cannot assign logic middleware instance to multiple states, create separate instance for each');
    }
    savedState = state;

    return next => {
      savedNext = next;
      const { action$, sub, logicCount: cnt } = applyLogic(
        logic,
        savedState,
        savedNext,
        logicSub,
        actionSrc$,
        deps,
        logicCount,
        monitor$
      );
      actionEnd$ = action$;
      logicSub = sub;
      logicCount = cnt;

      return action => {
        debug('starting off', action);
        monitor$.next({ action, op: 'top' });
        actionSrc$.next(action);
        return action;
      };
    };
  }

  /**
   * observable to monitor flow in logic
   */
  mw.monitor$ = monitor$;

  /**
   * Resolve promise when all in-flight actions are complete passing
   * through fn if provided
   * @param {function} fn optional fn() which is invoked on completion
   * @return {promise} promise resolves when all are complete
   */
  mw.whenComplete = function whenComplete(fn = identity) {
    return (
      lastPending$
        // .do(x => console.log('wc', x)) /* keep commented out */
        .takeWhile(x => x.pending)
        .map((/* x */) => undefined) // not passing along anything
        .toPromise()
        .then(fn)
    );
  };

  /**
   * add additional deps after createStore has been run. Useful for
   * dynamically injecting dependencies for the hooks. Throws an error
   * if it tries to override an existing dependency with a new
   * value or instance.
   * @param {object} additionalDeps object of dependencies to add
   * @return {undefined}
   */
  mw.addDeps = function addDeps(additionalDeps) {
    if (typeof additionalDeps !== 'object') {
      throw new Error('addDeps should be called with an object');
    }
    Object.keys(additionalDeps).forEach(k => {
      const existing = deps[k];
      const newValue = additionalDeps[k];
      if (
        typeof existing !== 'undefined' && // previously existing dep
        existing !== newValue
      ) {
        // no override
        throw new Error(`addDeps cannot override an existing dep value: ${k}`);
      }
      // eslint-disable-next-line no-param-reassign
      deps[k] = newValue;
    });
  };

  /**
   * add logic after createStore has been run. Useful for dynamically
   * loading bundles at runtime. Existing state in logic is preserved.
   * @param {array} arrNewLogic array of logic items to add
   * @return {object} object with a property logicCount set to the count of logic items
   */
  mw.addLogic = function addLogic(arrNewLogic) {
    if (!arrNewLogic.length) {
      return { logicCount };
    }

    const combinedLogic = savedLogicArr.concat(arrNewLogic);
    const duplicatedLogic = findDuplicates(combinedLogic);
    if (duplicatedLogic.length) {
      throw new Error(`duplicate logic, indexes: ${duplicatedLogic}`);
    }

    const { action$, sub, logicCount: cnt } = applyLogic(
      arrNewLogic,
      savedState,
      savedNext,
      logicSub,
      actionEnd$,
      deps,
      logicCount,
      monitor$
    );
    actionEnd$ = action$;
    logicSub = sub;
    logicCount = cnt;
    savedLogicArr = combinedLogic;
    debug('added logic');
    return { logicCount: cnt };
  };

  mw.mergeNewLogic = function mergeNewLogic(arrMergeLogic) {
    // check for duplicates within the arrMergeLogic first
    const duplicatedLogic = findDuplicates(arrMergeLogic);
    if (duplicatedLogic.length) {
      throw new Error(`duplicate logic, indexes: ${duplicatedLogic}`);
    }
    // filter out any refs that match existing logic, then addLogic
    const arrNewLogic = arrMergeLogic.filter(x => savedLogicArr.indexOf(x) === -1);
    return mw.addLogic(arrNewLogic);
  };

  /**
   * Replace all existing logic with a new array of logic.
   * In-flight requests should complete. Logic state will be reset.
   * @param {array} arrRepLogic array of replacement logic items
   * @return {object} object with a property logicCount set to the count of logic items
   */
  mw.replaceLogic = function replaceLogic(arrRepLogic) {
    const duplicatedLogic = findDuplicates(arrRepLogic);
    if (duplicatedLogic.length) {
      throw new Error(`duplicate logic, indexes: ${duplicatedLogic}`);
    }

    const { action$, sub, logicCount: cnt } = applyLogic(
      arrRepLogic,
      savedState,
      savedNext,
      logicSub,
      actionSrc$,
      deps,
      0,
      monitor$
    );
    actionEnd$ = action$;
    logicSub = sub;
    logicCount = cnt;
    savedLogicArr = arrRepLogic;
    debug('replaced logic');

    return { logicCount: cnt };
  };

  return mw;
};
