// import { Observable } from 'rxjs/Observable';
// import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/zip';

import { StateStream } from './StateStream';

import { debug } from './utils';
import Logic from './Logic';
import LogicWrapper from './LogicWrapper';

// initial monitor op before anything else
// const OP_INIT = 'init';

class LogicEnhancer {
  /**
   * @param {*} options
   */
  constructor(...options) {
    Object.assign(this, ...options);

    this.logicSub = null;
    this.zip = null;
  }

  /**
   * @param {*} act
   * @param {*} act.type
   * @param {*} act.state
   * @param {*} act.actions
   */
  enhance(act) {
    // get our current stream
    const cur = this.stateStream$.getValue();
    // set the state to the current + new
    act.state = { ...act.state, ...cur };

    if (act.type in this.logic) {
      // Apply logic
      this.applyLogicFor(act.type);
    }

    this.stateStream$.next(act);

    // this.actionSrc$.next(act);
    // this.monitor$.next({ act, op: 'top' });
  }

  /**
   * @param {*} type
   */
  applyLogicFor(type) {
    if (this.logicSub) {
      this.logicSub.unsubscribe();
    }

    const logic = this.logic[type];
    const namedLogic = Logic.naming(logic);
    const stateOut$ = LogicWrapper(namedLogic, this.stateStream$, this.deps);

    this.logicSub = stateOut$.subscribe(actionEnd => {
      debug('actEnd', actionEnd);
      // at this point, action is the transformed action, not original
      // this.monitor$.next({ nextAction: actionEnd, op: 'bottom' });
    });
  }

  /**
   * Find duplicates in arrLogic by checking if ref to same logic object
   * @param {array} arrLogic array of logic to check
   * @return {array} array of indexes to duplicates, empty array if none
   */
  static findDuplicates(arrLogic) {
    return arrLogic.reduce((acc, x1, idx1) => {
      if (arrLogic.some((x2, idx2) => idx1 !== idx2 && x1 === x2)) {
        acc.push(idx1);
      }
      return acc;
    }, []);
  }

  static createLogicEnhancer(logic, deps) {
    // const monitor$ = new Subject(); // Monitor the execution flow
    // const lastPending$ = new BehaviorSubject({ op: OP_INIT });

    // monitor$
    //   .scan(
    //     (acc, x) => {
    //       // append a pending logic count
    //       let pending = acc.pending || 0;
    //       switch (x.op) { // eslint-disable-line default-case
    //         case 'top': // action at top of logic stack
    //         case 'begin': // starting into a logic
    //           pending += 1;
    //           break;
    //         case 'end': // completed from a logic
    //         case 'bottom': // action cleared bottom of logic stack
    //         case 'nextDisp': // action changed type and executed
    //         case 'filtered': // action filtered
    //         case 'dispError': // error when dispatching
    //         case 'cancelled': // action cancelled before intercept complete
    //           // dispCancelled is not included here since
    //           // already accounted for in the 'end' op
    //           pending -= 1;
    //           break;
    //       }
    //       const flow = {
    //         ...x,
    //         pending
    //       };
    //       // debug('x.op = ', x.op);
    //       // debug('acc = ', acc);
    //       return flow;
    //     },
    //     { pending: 0 }
    //   )
    //   .subscribe(lastPending$); // pipe to lastPending

    const appLogic = logic.reduce((globalLogic, mappedLogic, idx) => {
      const _globalLogic = globalLogic;
      const mappedLogic$ = Logic.createLogic(mappedLogic);

      const { type } = mappedLogic$;

      _globalLogic[type] = {
        ...mappedLogic$,
        idx
      };

      return _globalLogic;
    }, {});

    const stateStream$ = new StateStream();

    // const actionSrc$ = new Subject(); // logicEnhancer action stream
    // let logicCount = 0; // used for implicit naming
    // const savedLogicArr = logicOrApp; // keep for uniqueness check
    return new LogicEnhancer({
      stateStream$,
      // actionsStream$,
      logic: appLogic,
      deps
    });
  }
}

export default LogicEnhancer;
