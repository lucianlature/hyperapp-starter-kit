import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/of';

import { debug, naming } from './utils';
import wrapper from './logicWrapper';

// initial monitor op before anything else
const OP_INIT = 'init';

export default function createLogicEnhancer(logicOrApp, deps) {
  const monitor$ = new Subject(); // Monitor all activity
  const lastPending$ = new BehaviorSubject({ op: OP_INIT });
  const actionSrc$ = new Subject(); // logicEnhancer action stream

  monitor$
    .scan((acc, x) => {
      // append a pending logic count
      let pending = acc.pending || 0;
      switch (x.op) { // eslint-disable-line default-case
        case 'top': // action at top of logic stack
        case 'begin': // starting into a logic
          pending += 1;
          break;
        case 'end': // completed from a logic
        case 'bottom': // action cleared bottom of logic stack
        case 'nextDisp': // action changed type and executed
        case 'filtered': // action filtered
        case 'dispError': // error when dispatching
        case 'cancelled': // action cancelled before intercept complete
        // dispCancelled is not included here since
        // already accounted for in the 'end' op
          pending -= 1;
          break;
      }
      const flow = {
        ...x,
        pending,
      };
      // debug('x.op = ', x.op);
      return flow;
    }, { pending: 0 })
    .subscribe(lastPending$); // pipe to lastPending

  const appLogic = logicOrApp.reduce((globalLogic, mappedLogic, idx) => {
    const globalLogic$ = globalLogic;
    const { type } = mappedLogic;

    globalLogic$[type] = {
      ...mappedLogic,
      idx,
    };
    return globalLogic$;
  }, {});

  let logicSub = null;
  // let logicCount = 0; // used for implicit naming
  // const savedLogicArr = logicOrApp; // keep for uniqueness check

  function logicEnhancer() {
    // return () => {
    //   const { action$, sub, logicCount: cnt } =
    //     applyLogic(
    //       arrLogic,
    //       savedState,
    //       logicSub,
    //       actionSrc$,
    //       deps,
    //       logicCount,
    //       monitor$
    //     );
    //   actionEnd$ = action$;
    //   logicSub = sub;
    //   logicCount = cnt;
  }

  logicEnhancer.appLogic = appLogic;
  logicEnhancer.deps = deps;
  logicEnhancer.actionSrc$ = actionSrc$;
  logicEnhancer.logicSub = logicSub;

  /**
   * observable to monitor flow in logic
   */
  logicEnhancer.monitor$ = monitor$;

  logicEnhancer.enhance = (name, state, actions) => {
    if (name in appLogic) {
      // Apply logic
      logicEnhancer.applyLogicFor(name);
    }

    logicEnhancer.startAction({
      type: name,
      state,
      actions,
    });
  };

  logicEnhancer.applyLogicFor = (name) => {
    if (logicSub) {
      logicSub.unsubscribe();
    }

    const logic = appLogic[name];
    const { idx } = logic;
    const namedLogic = naming(logic, idx);
    const wrappedLogic = wrapper(namedLogic, monitor$, deps);
    const actionOut$ = wrappedLogic(actionSrc$);
    logicSub = actionOut$.subscribe((actionEnd$) => {
      debug('actEnd$', actionEnd$);
      // at this point, action is the transformed action, not original
      monitor$.next({ actionEnd$, op: 'bottom' });
    });
  };

  logicEnhancer.startAction = (act) => {
    actionSrc$.next(act);
    monitor$.next({ act, op: 'top' });
  };

  return logicEnhancer;
}
