import isObservable from 'is-observable';
import isPromise from 'is-promise';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
// import 'rxjs/Rx/pipe';
// import { pipe } from 'rxjs/Rx';
import { distinctUntilChanged, catchError, shareReplay } from 'rxjs/operators';

// import { debug, confirmProps } from './utils';

const UNHANDLED_LOGIC_ERROR = 'UNHANDLED_LOGIC_ERROR';
const { NODE_ENV } = process.env;

class LogicAction {
  /**
   * @param {*} param
   */
  static createLogicAction$({ action, logic, state, deps, cancel$, monitor$ }) {
    const {
      name,
      warnTimeout,
      process: processFn,
      processOptions: { dispatchReturn, dispatchMultiple /* , successType, failType */ }
    } = logic;

    // debug('createLogicAction name = ', name);
    // debug('createLogicAction action = ', action);

    monitor$.next({ action, name, op: 'begin' });

    // const intercept = logic.validate || logic.transform; // aliases

    const logicActionObserver = logicActionObserver => {
      function storeDispatch(act) {
        return state.dispatch(act);
      }

      function mapToActionAndDispatch(actionOrValue) {
        const act = successType ? mapToAction(successType, actionOrValue, false) : actionOrValue;

        if (act) {
          monitor$.next({ action, dispAction: act, op: 'dispatch' });
        }
      }

      /* eslint-disable consistent-return */
      function mapErrorToActionAndDispatch(actionOrValue) {
        if (failType) {
          // we have a failType, if truthy result we will use it
          const act = mapToAction(failType, actionOrValue, true);
          if (act) {
            monitor$.next({ action, dispAction: act, op: 'dispatch' });
            return storeDispatch(act);
          }
          return; // falsey result from failType, no dispatch
        }

        // no failType so must wrap values with no type
        if (actionOrValue instanceof Error) {
          const act = actionOrValue.type
            ? actionOrValue // has type
            : {
                type: UNHANDLED_LOGIC_ERROR,
                payload: actionOrValue,
                error: true
              };
          monitor$.next({ action, dispAction: act, op: 'dispatch' });
          return storeDispatch(act);
        }

        // dispatch objects or functions as is
        const typeOfValue = typeof actionOrValue;
        if (
          actionOrValue && // not null and is object | fn
          (typeOfValue === 'object' || typeOfValue === 'function')
        ) {
          monitor$.next({ action, dispAction: actionOrValue, op: 'dispatch' });
          return storeDispatch(actionOrValue);
        }

        // wasn't an error, obj, or fn, so we will wrap in unhandled
        monitor$.next({
          action,
          dispAction: {
            type: UNHANDLED_LOGIC_ERROR,
            payload: actionOrValue,
            error: true
          },
          op: 'dispatch'
        });
      }

      /* eslint-enable consistent-return */
      const dispatch$ = new Subject().mergeAll().takeUntil(cancel$);
      dispatch$
        .do(
          mapToActionAndDispatch, // next
          mapErrorToActionAndDispatch // error
        )
        .subscribe({
          error: () => {
            // signalling complete here since error was dispatched accordingly,
            // otherwise if we were to signal an error here
            // then cancelled$ subscriptions would have to specifically handle error in subscribe,
            // otherwise it will throw. So it doesn't seem that it is worth it.
            monitor$.next({ action, name, op: 'end' });
            cancelled$.complete();
            cancelled$.unsubscribe();
          },
          complete: () => {
            monitor$.next({ action, name, op: 'end' });
            cancelled$.complete();
            cancelled$.unsubscribe();
          }
        });

      // In non-production mode only we will setup a warning timeout that
      // will console.error if logic has not completed by the time it fires
      // warnTimeout can be set to 0 to disable
      if (NODE_ENV !== 'production' && warnTimeout) {
        Observable.timer(warnTimeout)
          // take until cancelled, error-ed, or completed
          .takeUntil(cancelled$.defaultIfEmpty(true))
          .do(() => {
            // eslint-disable-next-line no-console
            console.error(
              `warning: logic (${name}) is still running after ${warnTimeout /
                1000}s, forget to call done()? For non-ending logic, set warnTimeout: 0`
            );
          })
          .subscribe();
      }

      // allowMore is now deprecated in favor of variable process arity
      // which sets processOptions.dispatchMultiple = true then
      // expects done() cb to be called to end
      // Might still be needed for internal use so keeping it for now

      // passed into each execution phase hook as first argument
      const depObj = {
        ...deps,
        cancelled$,
        ctx: {}, // for sharing data between hooks
        state,
        action
      };

      function handleNextOrDispatch(shouldProcess, act, options) {
        const { useDispatch } = applyAllowRejectNextDefaults(options);

        if (shouldDispatch(act, useDispatch)) {
          monitor$.next({
            action,
            dispAction: act,
            name,
            shouldProcess,
            op: 'nextDisp'
          });
          interceptComplete = true;
          dispatch(act, { allowMore: true }); // will be completed later
          logicActionObserver.complete(); // dispatched action, so no next(act)
        } else {
          // normal next
          if (act) {
            monitor$.next({
              action,
              nextAction: act,
              name,
              shouldProcess,
              op: 'next'
            });
          } else {
            // act is undefined, filtered
            monitor$.next({
              action,
              name,
              shouldProcess,
              op: 'filtered'
            });
            interceptComplete = true;
          }
          postIfDefinedOrComplete(act, logicActionObserver);
        }

        // unless rejected, we will process even if allow/next dispatched
        if (shouldProcess) {
          // processing, was an accept
          // if action provided is empty, give process orig
          depObj.action = act || action;
          try {
            const retValue = processFn(depObj, dispatch, done);
            // processOption.dispatchReturn true
            if (dispatchReturn) {
              // returning undefined won't dispatch
              if (typeof retValue === 'undefined') {
                dispatch$.complete();
              } else {
                // defined return value, dispatch
                dispatch(retValue);
              }
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`unhandled exception in logic named: ${name}`, err);
            // wrap in observable since might not be an error object
            dispatch(Observable.throw(err));
          }
        } else {
          // not processing, must have been a reject
          dispatch$.complete();
        }
      }

      const DispatchDefaults = {
        allowMore: false
      };

      function applyDispatchDefaults(options) {
        return {
          ...DispatchDefaults,
          ...options
        };
      }

      function dispatch(act, options = DispatchDefaults) {
        const { allowMore } = applyDispatchDefaults(options);
        // ignore empty action
        if (typeof act !== 'undefined') {
          // eslint-disable-next-line no-nested-ternary
          const next$ = isObservable(act)
            ? act
            : // eslint-disable-next-line no-nested-ternary
              isPromise(act)
              ? Observable.fromPromise(act)
              : act instanceof Error ? Observable.throw(act) : Observable.of(act);
          // create obs for mergeAll
          dispatch$.next(next$);
        }
        if (!(dispatchMultiple || allowMore)) {
          dispatch$.complete();
        }
        return act;
      }

      function shouldDispatch(act, useDispatch) {
        if (!act) {
          return false;
        }

        if (useDispatch === 'auto') {
          // dispatch on diff type
          return act.type !== action.type;
        }

        // otherwise forced truthy/falsy
        return useDispatch;
      }

      const AllowRejectNextDefaults = {
        useDispatch: 'auto'
      };

      function applyAllowRejectNextDefaults(options) {
        return {
          ...AllowRejectNextDefaults,
          ...options
        };
      }

      // const _proxy = allow => (act, options = AllowRejectNextDefaults) => handleNextOrDispatch(allow, act, options);

      /* post if defined, then complete */
      function postIfDefinedOrComplete(act, act$) {
        if (act) {
          act$.next(act);
        }
        interceptComplete = true;
        act$.complete();
      }

      function done() {
        dispatch$.complete();
      }

      // intercept(depObj, _proxy(true), _proxy(false));
      handleNextOrDispatch(true, depObj.action, AllowRejectNextDefaults);
    };

    const logicAction$ = Observable.create(logicActionObserver)
      .take(1)
      .takeUntil(cancel$);

    return logicAction$;
  }
}

export default LogicAction;
